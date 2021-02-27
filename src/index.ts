import joplin from 'api';
import { ToolbarButtonLocation } from "api/types";
import { ChangeEvent } from 'api/JoplinSettings';
import { MenuItem, MenuItemLocation } from 'api/types';
import { JiraClient } from "./jiraClient";
import { Settings } from "./settings";

joplin.plugins.register({
    onStart: async function () {
        const jiraIssueTagOpenPattern = new RegExp('<JiraIssue +key=\"[A-Z0-9\-]+\" *\/?>');
        const jiraIssueTagOpenClosePattern = new RegExp('<JiraIssue +key=\"[A-Z0-9\-]+\" *\/?>[^<]*<\/JiraIssue>');
        const jiraIssueRowPattern = new RegExp('^.*<JiraIssue +key=\"([A-Z0-9\-]+)\" *\/?>[^<]*(<\/JiraIssue>)?.*$');
        const settings = new Settings();
        const jiraClient = new JiraClient(settings);


        function containsJiraIssueHtmlBlock(row: string): boolean {
            // console.log("containsJiraIssueHtmlBlock", row, jiraIssueRowPattern.test(row));
            return jiraIssueRowPattern.test(row);
        }

        async function processJiraIssue(rows: string[], index: number) {
            console.log("processJiraIssue", rows[index]);
            const matches = rows[index].match(jiraIssueRowPattern);
            if (matches) {
                const issueStatus = await jiraClient.query(matches[1]);
                var replacePattern;
                if (matches[2]) {
                    replacePattern = jiraIssueTagOpenClosePattern;
                } else {
                    replacePattern = jiraIssueTagOpenPattern;
                }
                rows[index] = rows[index].replace(replacePattern,
                    '<JiraIssue key="' + matches[1] + '">' + issueStatus + '</JiraIssue>')
            }
        }

        async function scanNote() {
            const note = await joplin.workspace.selectedNote();
            if (!note) {
                alert("Please select a note.");
                return;
            }
            const rows = (note.body as string).split("\n");
            for (let i = 0; i < rows.length; i++) {
                if (containsJiraIssueHtmlBlock(rows[i])) {
                    await processJiraIssue(rows, i);
                }
            }
            await joplin.commands.execute("editor.setText", rows.join("\n"));
        }

        // Register settings
        settings.register();
        joplin.settings.onChange(async (event: ChangeEvent) => {
            await settings.read(event);
        });

        // Register new command
        await joplin.commands.register({
            name: "jiraIssueRefresh",
            label: "Retrieve Jira Issues status",
            iconName: "fa fa-sitemap",
            execute: async () => {
                await scanNote();
            },
        });

        // Tools menu
        joplin.views.toolbarButtons.create(
            "jiraIssueBtn",
            "jiraIssueRefresh",
            ToolbarButtonLocation.EditorToolbar
        );

        // Menu bar
        const commandsSubMenu: MenuItem[] = [
            {
                commandName: "jiraIssueRefresh",
                label: 'Retrieve Jira Issues status'
            }
        ];
        await joplin.views.menus.create('toolsJiraIssue', 'JiraIssue', commandsSubMenu, MenuItemLocation.Tools);
    },
});
