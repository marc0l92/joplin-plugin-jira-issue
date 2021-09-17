import joplin from 'api'
import { ToolbarButtonLocation, ContentScriptType } from "api/types"
import { ChangeEvent } from 'api/JoplinSettings'
import { MenuItem, MenuItemLocation } from 'api/types'
import { JiraClient } from "./jiraClient"
import { Settings } from "./settings"
import { View } from "./view"


enum Config {
    MarkdownBlockId = 'jira',
}

const Templates: any = {
    issue: '<JiraIssue key="AAA-123">',
    search: ['<JiraSearch jql="', '" max="10"></JiraSearch>'],
}
const Patterns: any = {
    attributes: new RegExp(' *(?<key>[a-z]+)=\"(?<value>[^"]+)\" *'),
    issue: {
        open: new RegExp('<JiraIssue +(?<attributes>[^>]+?) *\/?>', 'i'),
        close: new RegExp('<\/JiraIssue>', 'i'),
        openClose: new RegExp('<JiraIssue +[^>]+? *\/?>.*<\/JiraIssue>', 'i'),
    },
    search: {
        open: new RegExp('<JiraSearch +(?<attributes>[^>]+?) *\/?>', 'i'),
        close: new RegExp('<\/JiraSearch>', 'i'),
    },
}

joplin.plugins.register({
    onStart: async function () {
        const settings = new Settings()
        const jiraClient = new JiraClient(settings)
        const view = new View(settings)

        function unpackAttributes(attributesStr: string): any {
            const attributesObj = {}
            while (attributesStr.length > 0) {
                const matches = attributesStr.match(Patterns.attributes)
                if (!matches || !matches.groups) {
                    break
                }
                attributesObj[matches.groups.key] = matches.groups.value.replace(/&quot/g, '"')
                attributesStr = attributesStr.slice(matches[0].length)
            }
            return attributesObj
        }

        function containsJiraIssueOpenBlock(row: string): boolean {
            return Patterns.issue.open.test(row)
        }
        function containsJiraIssueCloseBlock(row: string): boolean {
            return Patterns.issue.close.test(row)
        }
        function containsJiraSearchOpenBlock(row: string): boolean {
            return Patterns.search.open.test(row)
        }
        function containsJiraSearchCloseBlock(row: string): boolean {
            return Patterns.search.close.test(row)
        }


        async function processJiraSearch(rows: string[], indexOpen: number, indexClose: number): Promise<void> {
            console.log("processJiraSearch", rows[indexOpen])
            const matches = rows[indexOpen].match(Patterns.search.open)
            if (matches && matches.groups) {
                let viewOutput: string = ''
                try {
                    const attributes = unpackAttributes(matches.groups.attributes)
                    const searchResults = await jiraClient.getSearchResults(attributes.jql, attributes.max)

                    viewOutput += await view.renderHeader(settings.searchRenderingMode)
                    for (let i in searchResults.issues) {
                        const issue = searchResults.issues[i]
                        await jiraClient.updateStatusColorCache(issue.fields.status.name)
                        viewOutput += await view.renderIssue(issue, settings.searchRenderingMode) + '\n'
                    }
                } catch (err) {
                    viewOutput = err
                }

                // Delete text between tags
                rows.splice(indexOpen + 1, indexClose - indexOpen)
                // Add new line
                rows[indexOpen] = matches[0] + '\n\n' + viewOutput + '</JiraSearch>'
            }
        }

        async function processJiraIssue(rows: string[], index: number): Promise<void> {
            console.log("processJiraIssue", rows[index])
            const matches = rows[index].match(Patterns.issue.open)
            if (matches && matches.groups) {
                let viewOutput: string
                try {
                    const attributes = unpackAttributes(matches.groups.attributes)
                    const issue = await jiraClient.getIssue(attributes.key)
                    await jiraClient.updateStatusColorCache(issue.fields.status.name)
                    viewOutput = await view.renderIssue(issue, settings.issueRenderingMode)
                } catch (err) {
                    viewOutput = err
                }

                let replacePattern
                if (containsJiraIssueCloseBlock(rows[index])) {
                    replacePattern = Patterns.issue.openClose
                } else {
                    replacePattern = Patterns.issue.open
                }
                rows[index] = rows[index].replace(replacePattern, matches[0] + viewOutput + '</JiraIssue>')
            }
        }

        async function scanNote() {
            // Get the note content
            const note = await joplin.workspace.selectedNote()
            if (!note) {
                await joplin.views.dialogs.showMessageBox("Please select a note.")
                return
            }
            const rows = (note.body as string).split("\n")

            // Scan the document for JiraSearch blocks
            for (let i = 0; i < rows.length; i++) {
                if (containsJiraSearchOpenBlock(rows[i])) {
                    for (let j = i; j < rows.length; j++) {
                        if (containsJiraSearchCloseBlock(rows[j])) {
                            await processJiraSearch(rows, i, j)
                            break
                        }
                    }
                }
            }
            // Scan the document for JiraIssue blocks
            for (let i = 0; i < rows.length; i++) {
                if (containsJiraIssueOpenBlock(rows[i])) {
                    await processJiraIssue(rows, i)
                }
            }

            // Save changes
            await joplin.commands.execute("editor.setText", rows.join("\n"))
            await joplin.commands.execute('editor.focus')
            // await joplin.views.dialogs.showMessageBox("JiraIssue: Refresh completed.")
        }

        /**
         * Register Commands
         */

        // Register settings
        settings.register();
        joplin.settings.onChange(async (event: ChangeEvent) => {
            await settings.read(event)
        })

        // Register command
        await joplin.commands.register({
            name: "jiraIssue-refresh",
            label: "JiraIssue: Refresh issues",
            iconName: "fa fa-sitemap",
            execute: async () => {
                await scanNote()
            },
        })
        await joplin.commands.register({
            name: "jiraIssue-issueTemplate",
            label: "JiraIssue: Insert issue template",
            iconName: "fa fa-pencil",
            execute: async () => {
                await joplin.commands.execute("insertText", Templates.issue)
            },
        })
        await joplin.commands.register({
            name: "jiraIssue-searchTemplate",
            label: "JiraIssue: Insert search template",
            iconName: "fa fa-pencil",
            execute: async () => {
                await joplin.commands.execute("insertText", Templates.search[0] + settings.searchTemplateQuery + Templates.search[1])
            },
        })

        // Register toolbar buttons
        joplin.views.toolbarButtons.create("toolsbarButton-jiraIssue-refresh", "jiraIssue-refresh", ToolbarButtonLocation.EditorToolbar)

        // Register menu
        const commandsSubMenu: MenuItem[] = [
            {
                commandName: "jiraIssue-refresh",
            },
            {
                commandName: "jiraIssue-issueTemplate",
            },
            {
                commandName: "jiraIssue-searchTemplate",
            },
        ]
        await joplin.views.menus.create('menu-jiraIssue', 'JiraIssue', commandsSubMenu, MenuItemLocation.Tools)

        // Register context menu items
        await joplin.views.menuItems.create('contextMenu-jiraIssue-refresh', 'jiraIssue-refresh', MenuItemLocation.EditorContextMenu)
        await joplin.views.menuItems.create('contextMenu-jiraIssue-issueTemplate', 'jiraIssue-issueTemplate', MenuItemLocation.EditorContextMenu)
        await joplin.views.menuItems.create('contextMenu-jiraIssue-searchTemplate', 'jiraIssue-searchTemplate', MenuItemLocation.EditorContextMenu)





        await joplin.contentScripts.register(
            ContentScriptType.MarkdownItPlugin,
            Config.MarkdownBlockId,
            './contentScript/contentScript.js'
        );
        await joplin.contentScripts.onMessage(Config.MarkdownBlockId, (message: string) => {
            console.log("pluginBe", message)
            return message + '+response';
        });
    },
})
