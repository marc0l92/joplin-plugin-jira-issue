import joplin from 'api';
import { ToolbarButtonLocation } from "api/types";
import { match } from 'assert';
import { JiraClient } from "./lib/jiraClient";

joplin.plugins.register({
    onStart: async function () {
        const jiraIssueTagOpenPattern = new RegExp('<JiraIssue +code=\"[A-Z0-9\-]+\" *\/?>');
        const jiraIssueTagOpenClosePattern = new RegExp('<JiraIssue +code=\"[A-Z0-9\-]+\" *\/?>[^<]*<\/JiraIssue>');
        const jiraIssueRowPattern = new RegExp('^.*<JiraIssue +code=\"([A-Z0-9\-]+)\" *\/?>[^<]*(<\/JiraIssue>)?.*$');
        const jiraClient = new JiraClient();
        console.info('onStart');

        function containsJiraIssueHtmlBlock(row: string): boolean {
            // console.log("containsJiraIssueHtmlBlock", row, jiraIssueRowPattern.test(row));
            return jiraIssueRowPattern.test(row);
        }

        async function processJiraIssue(rows: string[], index: number) {
            console.log("processJiraIssue", rows[index]);
            const matches = rows[index].match(jiraIssueRowPattern);
            if (matches) {
                // console.log(matches);
                const issueStatus = await jiraClient.query(matches[1]);
                var replacePattern;
                if (matches[2]) {
                    replacePattern = jiraIssueTagOpenClosePattern;
                } else {
                    replacePattern = jiraIssueTagOpenPattern;
                }
                rows[index] = rows[index].replace(replacePattern,
                    '<JiraIssue code="' + matches[1] + '">' + issueStatus + '</JiraIssue>')
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
                // console.log(rows[i]);
                if (containsJiraIssueHtmlBlock(rows[i])) {
                    await processJiraIssue(rows, i);
                }
            }
            await joplin.commands.execute("editor.setText", rows.join("\n"));
        }

        // Register new command
        await joplin.commands.register({
            name: "jiraIssue",
            label: "Retrieve Jira Tags status",
            iconName: "fa fa-sitemap",
            execute: async () => {
                console.info('onPress');
                await scanNote();
            },
        });

        joplin.views.toolbarButtons.create(
            "jiraIssueBtn",
            "jiraIssue",
            ToolbarButtonLocation.EditorToolbar
        );
    },
});
