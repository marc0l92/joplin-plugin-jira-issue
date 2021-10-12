import joplin from 'api'
import { ContentScriptType } from 'api/types'
import { ChangeEvent } from 'api/JoplinSettings'
import { MenuItem, MenuItemLocation } from 'api/types'
import { JiraClient } from './jiraClient'
import { Settings } from './settings'
import { View } from './view'
import { ObjectsCache } from './objectsCache'


enum Config {
    MarkdownIssueFenceId = 'jira-issue',
    MarkdownSearchFenceId = 'jira-search',
}

const Templates = {
    IssueInline: '<JiraIssue key="AAA-123">',
    IssueFence: '```jira-issue\n\n```',
    SearchInline: '<JiraSearch jql="">',
    SearchFence: '```jira-search\n\n```',
}

const CommandsId = {
    IssueInline: 'jiraIssue-issueInlineTemplate',
    IssueFence: 'jiraIssue-issueFenceTemplate',
    SearchInline: 'jiraIssue-searchInlineTemplate',
    SearchFence: 'jiraIssue-searchFenceTemplate',
    ClearCache: 'jiraIssue-clearCache',
}

joplin.plugins.register({
    onStart: async function () {
        const settings = new Settings()
        const jiraClient = new JiraClient(settings)
        const cache = new ObjectsCache(settings)
        const view = new View(settings)

        /**
         * Register Commands
         */

        // Register settings
        settings.register();
        joplin.settings.onChange(async (event: ChangeEvent) => {
            await settings.read(event)
            cache.clear()
        })

        // Register command
        await joplin.commands.register({
            name: CommandsId.IssueInline,
            label: 'JiraIssue: Insert inline issue template',
            iconName: 'fa fa-pencil',
            execute: async () => {
                await joplin.commands.execute('insertText', Templates.IssueInline)
            },
        })
        await joplin.commands.register({
            name: CommandsId.IssueFence,
            label: 'JiraIssue: Insert issues block template',
            iconName: 'fa fa-pencil',
            execute: async () => {
                await joplin.commands.execute('insertText', Templates.IssueFence)
            },
        })
        await joplin.commands.register({
            name: CommandsId.SearchInline,
            label: 'JiraIssue: Insert inline search template',
            iconName: 'fa fa-pencil',
            execute: async () => {
                await joplin.commands.execute('insertText', Templates.SearchInline)
            },
        })
        await joplin.commands.register({
            name: CommandsId.SearchFence,
            label: 'JiraIssue: Insert searches block template',
            iconName: 'fa fa-pencil',
            execute: async () => {
                await joplin.commands.execute('insertText', Templates.SearchFence)
            },
        })
        await joplin.commands.register({
            name: CommandsId.ClearCache,
            label: 'JiraIssue: Clear cache',
            iconName: 'fa fa-sync',
            execute: async () => {
                cache.clear()
            },
        })

        // Register menu
        const commandsSubMenu: MenuItem[] = Object.values(CommandsId).map(command => ({ commandName: command }))
        await joplin.views.menus.create('menu-jiraIssue', 'JiraIssue', commandsSubMenu, MenuItemLocation.Tools)

        // Register context menu items
        await joplin.views.menuItems.create('contextMenu-' + CommandsId.IssueInline, CommandsId.IssueInline, MenuItemLocation.EditorContextMenu)
        await joplin.views.menuItems.create('contextMenu-' + CommandsId.SearchInline, CommandsId.SearchInline, MenuItemLocation.EditorContextMenu)


        // Content Scripts
        await joplin.contentScripts.register(
            ContentScriptType.MarkdownItPlugin,
            Config.MarkdownIssueFenceId,
            './contentScript/issueContentScript.js'
        );
        await joplin.contentScripts.register(
            ContentScriptType.MarkdownItPlugin,
            Config.MarkdownSearchFenceId,
            './contentScript/searchContentScript.js'
        );

        /**
         * Messages handling
         */

        function extractIssueKey(fenceLine: string) {
            // Remove comments
            fenceLine = fenceLine.replace(/\s*#.*$/, '')
            fenceLine = fenceLine.replace(settings.get('jiraHost') + '/browse/', '')
            return fenceLine.trim()
        }
        function extractSearchQuery(fenceLine: string) {
            // Remove comments
            fenceLine = fenceLine.replace(/\s*#.*$/, '')
            return fenceLine.trim()
        }

        await joplin.contentScripts.onMessage(Config.MarkdownIssueFenceId, async (message: string) => {
            // console.log('Issue message:', message)

            const issues = message.split('\n')
            let outputHtml = ''
            for (let i in issues) {
                try {
                    const issueKey = extractIssueKey(issues[i])
                    if (issueKey) {
                        // console.log('Detected issue:', issueKey)

                        let cachedIssue = cache.getCachedObject(issueKey)
                        if (!cachedIssue) {
                            cachedIssue = await jiraClient.getIssue(issueKey)
                            await jiraClient.updateStatusColorCache(cachedIssue.fields.status.name)
                            cache.addCachedObject(issueKey, cachedIssue)
                        }
                        outputHtml += view.renderIssue(cachedIssue)
                    }
                } catch (err) {
                    outputHtml += view.renderError(issues[i], err)
                }
            }
            return outputHtml
        });

        await joplin.contentScripts.onMessage(Config.MarkdownSearchFenceId, async (message: string) => {
            // console.log('Search message:', message)

            const queries = message.replace(/&quot;/g, '"').split('\n')
            let outputHtml = ''
            for (let i in queries) {
                try {
                    const query = extractSearchQuery(queries[i])
                    if (query) {
                        // console.log('Detected query:', query)

                        let cachedSearchResults = cache.getCachedObject(query)
                        if (!cachedSearchResults) {
                            cachedSearchResults = await jiraClient.getSearchResults(query, settings.get('maxSearchResults'))
                            for (let i in cachedSearchResults.issues) {
                                await jiraClient.updateStatusColorCache(cachedSearchResults.issues[i].fields.status.name)
                            }
                            cache.addCachedObject(query, cachedSearchResults)
                        }
                        outputHtml += view.renderSearchResults(cachedSearchResults)
                    }
                } catch (err) {
                    outputHtml += view.renderError(queries[i], err)
                }
            }
            return outputHtml
        });
    },
})
