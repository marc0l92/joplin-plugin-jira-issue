import { count } from "node:console";
import { Settings } from "./settings";

export class View {
    private _settings: Settings;

    constructor(settings: Settings) {
        this._settings = settings;
    }

    private renderIssueAsText(issueJson: any): string {
        // Properties
        let props: string[] = [];
        if (this._settings.renderPriority) {
            props.push(`P: ${issueJson.fields.priority.name}`);
        }
        if (this._settings.renderCreator) {
            props.push(`C: ${issueJson.fields.creator.displayName}`);
        }
        if (this._settings.renderAssignee) {
            if (issueJson.fields.assignee) {
                props.push(`A: ${issueJson.fields.assignee.displayName}`);
            }
        }
        if (this._settings.renderReporter) {
            props.push(`R: ${issueJson.fields.reporter.displayName}`);
        }
        if (this._settings.renderType) {
            props.push(`T: ${issueJson.fields.issuetype.name}`);
        }

        // Output string
        let out: string = '';
        if (this._settings.renderTypeIcon) {
            out += `![${issueJson.fields.issuetype.name}](${issueJson.fields.issuetype.iconUrl})`;
        }
        if (this._settings.renderKey) {
            out += ` [${issueJson.key}](${this._settings.jiraHost}/browse/${issueJson.key})`;
        }
        if (this._settings.renderStatus) {
            out += ` \`${issueJson.fields.status.name}\``;
        }
        if (this._settings.renderSummary) {
            out += ` _${issueJson.fields.summary}_`;
        }
        if (this._settings.renderDueDate && issueJson.fields.duedate) {
            out += ` [Due: ${issueJson.fields.duedate}]`;
        }
        if (this._settings.renderProgress) {
            if (issueJson.fields.aggregateprogress.percent) {
                out += `[${issueJson.fields.aggregateprogress.percent}%]`;
            } else if (issueJson.fields.aggregateprogress.total > 0) {
                out += `[${issueJson.fields.aggregateprogress.progress / issueJson.fields.aggregateprogress.total * 100}]`;
            }
        }
        if (props.length > 0) {
            out += '<br/>[' + props.join('; ') + ']';
        }
        return out;
    }

    private async renderIssueWithBadges(issueJson: any): Promise<string> {
        // Properties
        let props: string[] = [];
        if (this._settings.renderPriority) {
            props.push(`![P: ${issueJson.fields.priority.name}](https://img.shields.io/badge/P-${encodeURI(issueJson.fields.priority.name)}-lightgray)`);
        }
        if (this._settings.renderCreator) {
            props.push(`![C: ${issueJson.fields.creator.displayName}](https://img.shields.io/badge/C-${encodeURI(issueJson.fields.creator.displayName)}-lightgray)`);
        }
        if (this._settings.renderAssignee) {
            if (issueJson.fields.assignee) {
                props.push(`![A: ${issueJson.fields.assignee.displayName}](https://img.shields.io/badge/C-${encodeURI(issueJson.fields.assignee.displayName)}-lightgray)`);
            }
        }
        if (this._settings.renderReporter) {
            props.push(`![R: ${issueJson.fields.reporter.displayName}](https://img.shields.io/badge/R-${encodeURI(issueJson.fields.reporter.displayName)}-lightgray)`);
        }
        if (this._settings.renderType) {
            props.push(`![T: ${issueJson.fields.issuetype.name}](https://img.shields.io/badge/T-${encodeURI(issueJson.fields.issuetype.name)}-lightgray)`);
        }

        // Output string
        let out: string = '';
        if (this._settings.renderTypeIcon) {
            out += `![${issueJson.fields.issuetype.name}](${issueJson.fields.issuetype.iconUrl})`;
        }
        if (this._settings.renderKey) {
            out += ` [${issueJson.key}](${this._settings.jiraHost}/browse/${issueJson.key})`;
        }
        if (this._settings.renderStatus) {
            const statusColor = await this._settings.getStatusColor(issueJson.fields.status.name);
            out += ` ![${issueJson.fields.status.name}](https://img.shields.io/badge/-${encodeURI(issueJson.fields.status.name)}-${statusColor})`;
        }
        if (this._settings.renderSummary) {
            out += ` _${issueJson.fields.summary}_`;
        }

        if (this._settings.renderProgress) {
            if (issueJson.fields.aggregateprogress.percent) {
                out += ` [${issueJson.fields.aggregateprogress.percent}%]`;
            } else if (issueJson.fields.aggregateprogress.total > 0) {
                out += ` [${issueJson.fields.aggregateprogress.progress / issueJson.fields.aggregateprogress.total * 100}]`;
            }
        }
        if (props.length > 0) {
            out += '<br/>' + props.join(' ');
        }
        return out;
    }

    private async renderTableHeader(): Promise<string> {
        let columns: number = 0;
        let out: string = '';

        // Output string
        if (this._settings.renderKey) {
            out += ' Key |';
            columns++;
        }
        if (this._settings.renderStatus) {
            out += ' Status |';
            columns++;
        }
        if (this._settings.renderSummary) {
            out += ' Summary |';
            columns++;
        }
        if (this._settings.renderDueDate) {
            out += ' Due Date |';
            columns++;
        }
        if (this._settings.renderProgress) {
            out += ' Progress |';
            columns++;
        }
        if (this._settings.renderPriority || this._settings.renderCreator || this._settings.renderAssignee || this._settings.renderReporter || this._settings.renderType) {
            out += ' Properties |';
            columns++;
        }
        if (columns > 0) {
            out = '|' + out + '\n|';
            for (let i = 0; i < columns; i++) {
                out += ' :--- |';
            }
            out += '\n';
        }
        return out;
    }

    private async renderIssueAsTableRow(issueJson: any): Promise<string> {
        // Properties
        let props: string[] = [];
        if (this._settings.renderPriority) {
            props.push(`P: ${issueJson.fields.priority.name}`);
        }
        if (this._settings.renderCreator) {
            props.push(`C: ${issueJson.fields.creator.displayName}`);
        }
        if (this._settings.renderAssignee) {
            if (issueJson.fields.assignee) {
                props.push(`A: ${issueJson.fields.assignee.displayName}`);
            }
        }
        if (this._settings.renderReporter) {
            props.push(`R: ${issueJson.fields.reporter.displayName}`);
        }
        if (this._settings.renderType) {
            props.push(`T: ${issueJson.fields.issuetype.name}`);
        }

        // Output string
        let out: string = '|';
        if (this._settings.renderKey) {
            if (this._settings.renderTypeIcon) {
                out += ` ![${issueJson.fields.issuetype.name}](${issueJson.fields.issuetype.iconUrl})`;
            } else {
                out += ' ';
            }
            out += `[${issueJson.key}](${this._settings.jiraHost}/browse/${issueJson.key}) |`;
        }
        if (this._settings.renderStatus) {
            out += ` \`${issueJson.fields.status.name}\` |`;
        }
        if (this._settings.renderSummary) {
            out += ` ${issueJson.fields.summary} |`;
        }
        if (this._settings.renderDueDate) {
            if (issueJson.fields.duedate) {
                out += ` ${issueJson.fields.duedate}`;
            }
            out += ` |`;
        }
        if (this._settings.renderProgress) {
            if (issueJson.fields.aggregateprogress.percent) {
                out += ` [${issueJson.fields.aggregateprogress.percent}%] |`;
            } else if (issueJson.fields.aggregateprogress.total > 0) {
                out += ` [${issueJson.fields.aggregateprogress.progress / issueJson.fields.aggregateprogress.total * 100}] |`;
            } else {
                out += ` | `;
            }
        }
        if (props.length > 0) {
            out += ' ' + props.join('; ') + ' |';
        }
        return out;
    }

    async renderHeader(renderMode: string): Promise<string> {
        switch (renderMode) {
            case 'TABLE':
                return this.renderTableHeader();
            default:
                return '';
        }
    }

    async renderIssue(issueJson: any, renderMode: string): Promise<string> {
        switch (renderMode) {
            case 'TEXT':
                return this.renderIssueAsText(issueJson);
            case 'BADGES':
                return await this.renderIssueWithBadges(issueJson);
            case 'TABLE':
                return this.renderIssueAsTableRow(issueJson);
            default:
                return this.renderIssueAsText(issueJson);
        }
    }
}
