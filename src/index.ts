import joplin from 'api';
import { ToolbarButtonLocation } from "api/types";
import { ChangeEvent } from 'api/JoplinSettings';
import { MenuItem, MenuItemLocation } from 'api/types';
import { JiraClient } from "./jiraClient";
import { Settings } from "./settings";
import { View } from "./view";

joplin.plugins.register({
    onStart: async function () {
        const jiraIssueTemplate = '<JiraIssue key="AAA-123">'
        const jiraIssueTagOpenPattern = new RegExp('<JiraIssue +key=\"([A-Z0-9\-]+)\" *\/?>');
        const jiraIssueTagClosePattern = new RegExp('<\/JiraIssue>');
        const jiraIssueTagOpenClosePattern = new RegExp('<JiraIssue +key=\"[A-Z0-9\-]+\" *\/?>.*<\/JiraIssue>');
        const settings = new Settings();
        const jiraClient = new JiraClient(settings);
        const view = new View(settings);


        function containsJiraBlock(row: string): boolean {
            return jiraIssueTagOpenPattern.test(row);
        }

        async function processJiraIssue(rows: string[], index: number) {
            console.log("processJiraIssue", rows[index]);
            const matches = rows[index].match(jiraIssueTagOpenPattern);
            if (matches) {
                let issueView: string;
                try {
                    const issue = await jiraClient.getIssue(matches[1]);
                    await jiraClient.updateStatusColorCache(issue.fields.status.name);
                    issueView = await view.renderIssue(issue);
                } catch (err) {
                    issueView = err;
                }

                let replacePattern;
                if (jiraIssueTagClosePattern.test(rows[index])) {
                    replacePattern = jiraIssueTagOpenClosePattern;
                } else {
                    replacePattern = jiraIssueTagOpenPattern;
                }
                rows[index] = rows[index].replace(replacePattern, matches[0] + issueView + '</JiraIssue>')
            }
        }

        async function scanNote() {
            // Get the note content
            const note = await joplin.workspace.selectedNote();
            if (!note) {
                alert("Please select a note.");
                return;
            }
            const rows = (note.body as string).split("\n");

            // Scan the document for JiraIssue blocks
            jiraClient.getSearchResults("project = STORM AND resolution = Unresolved ORDER BY priority DESC, updated DESC");
            for (let i = 0; i < rows.length; i++) {
                if (containsJiraBlock(rows[i])) {
                    await processJiraIssue(rows, i);
                }
            }

            // Save changes
            await joplin.commands.execute("editor.setText", rows.join("\n"));
            await joplin.commands.execute('editor.focus');
            alert("JiraIssue: refresh completed.");
        }

        // Register settings
        settings.register();
        joplin.settings.onChange(async (event: ChangeEvent) => {
            await settings.read(event);
        });

        // Register command
        await joplin.commands.register({
            name: "jiraIssue-refresh",
            label: "JiraIssue: refresh issues",
            iconName: "fa fa-sitemap",
            execute: async () => {
                await scanNote();
            },
        });
        await joplin.commands.register({
            name: "jiraIssue-issueTemplate",
            label: "JiraIssue: insert issue template",
            iconName: "fa fa-pencil",
            execute: async () => {
                await joplin.commands.execute("insertText", jiraIssueTemplate);
            },
        });

        // Register toolbar buttons
        joplin.views.toolbarButtons.create("toolsbarButton-jiraIssue-refresh", "jiraIssue-refresh", ToolbarButtonLocation.EditorToolbar);

        // Register menu
        const commandsSubMenu: MenuItem[] = [
            {
                commandName: "jiraIssue-refresh",
            },
            {
                commandName: "jiraIssue-issueTemplate",
            },
        ];
        await joplin.views.menus.create('menu-jiraIssue', 'JiraIssue', commandsSubMenu, MenuItemLocation.Tools);

        // Register context menu items
        await joplin.views.menuItems.create('contextMenu-jiraIssue-refresh', 'jiraIssue-refresh', MenuItemLocation.EditorContextMenu);
        await joplin.views.menuItems.create('contextMenu-jiraIssue-issueTemplate', 'jiraIssue-issueTemplate', MenuItemLocation.EditorContextMenu);
    },
});
