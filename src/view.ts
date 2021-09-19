import * as Templater from 'templater.js'
import { Settings } from "./settings"

export class View {
    private _settings: Settings

    constructor(settings: Settings) {
        this._settings = settings
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

    async renderIssue(issueJson: any): Promise<string> {
        console.log('renderIssue', issueJson, this._settings)
        const template = Templater(Templates.issue)

        let progress
        if (this._settings.renderProgress) {
            if (issueJson.fields.aggregateprogress.percent) {
                progress = issueJson.fields.aggregateprogress.percent
            } else if (issueJson.fields.aggregateprogress.total > 0) {
                progress = issueJson.fields.aggregateprogress.progress / issueJson.fields.aggregateprogress.total * 100
            }
        }

        return template({
            settings: this._settings,
            issue: issueJson,
            statusColor: this._settings.renderStatus ? await this._settings.getStatusColor(issueJson.fields.status.name) : undefined,
            progress: progress,
            jiraHost: this._settings.jiraHost,
        })
        return ''
    }

    async renderError(error: any): Promise<string> {
        return 'Error: ' + error
    }
}

const Templates = {
    issue: `
        <div class="jira-container">
            <details class="jira-issue">
                <summary class="flex-center">
                    <a href="{{jiraHost}}/browse/{{issue.key}}" class="flex-center">
                        {{#if (settings.renderTypeIcon, issue.fields.issuetype.iconUrl)}}
                        <img alt="{{issue.fields.issuetype.name}}" title="{{issue.fields.issuetype.name}}"
                            src="{{issue.fields.issuetype.iconUrl}}" />
                        {{/if}}
                        {{#if (settings.renderKey, issue.key)}}
                        <span>{{issue.key}}</span>
                        {{/if}}
                    </a>
                    {{#if (settings.renderSummary, issue.fields.summary)}}
                    <span>-</span>
                    <span>{{issue.fields.summary}}</span>
                    {{/if}}
                    {{#if (settings.renderStatus, issue.fields.status.name)}}
                    <span class="tag uppercase tag-{{statusColor}}" title="Status: {{issue.fields.status.name}}">{{issue.fields.status.name}}</span>
                    {{/if}}
                </summary>
                <div class="flex-center">
                    {{#if (settings.renderPriority, issue.fields.priority.name)}}
                    <span class="tag tag-grey" title="Priority: {{issue.fields.priority.name}}">P:
                        {{issue.fields.priority.name}}</span>
                    {{/if}}
                    {{#if (settings.renderCreator, issue.fields.creator.displayName)}}
                    <span class="tag tag-grey" title="Creator: {{issue.fields.creator.displayName}}">C:
                        {{issue.fields.creator.displayName}}</span>
                    {{/if}}
                    {{#if (settings.renderAssignee, issue.fields.assignee.displayName)}}
                    <span class="tag tag-grey" title="Assignee: {{issue.fields.assignee.displayName}}">A:
                        {{issue.fields.assignee.displayName}}</span>
                    {{/if}}
                    {{#if (settings.renderReporter, issue.fields.reporter.displayName)}}
                    <span class="tag tag-grey" title="Reporter: {{issue.fields.reporter.displayName}}">R:
                        {{issue.fields.reporter.displayName}}</span>
                    {{/if}}
                    {{#if (settings.renderType, issue.fields.issuetype.name)}}
                    <span class="tag tag-grey" title="Type: {{issue.fields.issuetype.name}}">T:
                        {{issue.fields.issuetype.name}}</span>
                    {{/if}}
                    {{#if (settings.renderProgress, progress)}}
                    <span class="tag tag-grey" title="Progress: {{progress}}">%: {{progress}}</span>
                    {{/if}}
                    {{#if (settings.renderDueDate, issueJson.fields.duedate)}}
                    <span class="tag tag-grey" title="Due date: {{issueJson.fields.duedate}}">DD:
                        {{issueJson.fields.duedate}}</span>
                    {{/if}}
                </div>
            </details>
        </div>
        `
}