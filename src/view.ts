import * as Templater from 'templater.js'
import { Settings } from "./settings"

export class View {
    private _settings: Settings

    constructor(settings: Settings) {
        this._settings = settings
    }

    renderSearchResults(searchResultsJson: any): string {
        console.log('renderSearchResults', searchResultsJson, this._settings)
        const template = Templater(Templates.searchRow)

        let outputHtml = Templates.searchHead

        for (let i in searchResultsJson.issues) {
            outputHtml += template({
                settings: this._settings.toObject(),
                data: searchResultsJson.issues[i],
                statusColor: this._settings.getStatusColor(searchResultsJson.issues[i].fields.status.name),
            })
        }

        return outputHtml + Templates.searchFoot
    }

    renderIssue(issueJson: any): string {
        console.log('renderIssue', issueJson, this._settings)
        const template = Templater(Templates.issue)

        let progress
        if (this._settings.get('renderProgress')) {
            if (issueJson.fields.aggregateprogress.percent) {
                progress = issueJson.fields.aggregateprogress.percent
            } else if (issueJson.fields.aggregateprogress.total > 0) {
                progress = issueJson.fields.aggregateprogress.progress / issueJson.fields.aggregateprogress.total * 100
            }
        }

        return template({
            settings: this._settings.toObject(),
            data: issueJson,
            statusColor: this._settings.get('renderStatus') ? this._settings.getStatusColor(issueJson.fields.status.name) : undefined,
            progress: progress,
        })
    }

    renderError(query: string, error: string): string {
        console.log('renderError', query, error)
        const template = Templater(Templates.error)

        return template({
            query: query,
            error: error.toString(),
        })
    }
}

const Templates = {
    issue: `
        <details class="jira-issue">
            <summary class="flex-center">
                <a href="{{settings.jiraHost}}/browse/{{data.key}}" class="flex-center">
                    {{#if (settings.renderTypeIcon, data.fields.issuetype.iconUrl)}}
                    <img alt="{{data.fields.issuetype.name}}" title="{{data.fields.issuetype.name}}"
                        src="{{data.fields.issuetype.iconUrl}}" />
                    {{/if}}
                    {{#if (settings.renderKey, data.key)}}
                    <span>{{data.key}}</span>
                    {{/if}}
                </a>
                {{#if (settings.renderSummary, data.fields.summary)}}
                <span>-</span>
                <span>{{data.fields.summary}}</span>
                {{/if}}
                {{#if (settings.renderStatus, data.fields.status.name)}}
                <span class="tag uppercase tag-{{statusColor}}" title="Status: {{data.fields.status.name}}">{{data.fields.status.name}}</span>
                {{/if}}
            </summary>
            <div class="flex-center">
                {{#if (settings.renderPriority, data.fields.priority.name)}}
                <span class="tag tag-medium-gray outline" title="Priority: {{data.fields.priority.name}}">P:
                    {{data.fields.priority.name}}</span>
                {{/if}}
                {{#if (settings.renderCreator, data.fields.creator.displayName)}}
                <span class="tag tag-medium-gray outline" title="Creator: {{data.fields.creator.displayName}}">C:
                    {{data.fields.creator.displayName}}</span>
                {{/if}}
                {{#if (settings.renderAssignee, data.fields.assignee.displayName)}}
                <span class="tag tag-medium-gray outline" title="Assignee: {{data.fields.assignee.displayName}}">A:
                    {{data.fields.assignee.displayName}}</span>
                {{/if}}
                {{#if (settings.renderReporter, data.fields.reporter.displayName)}}
                <span class="tag tag-medium-gray outline" title="Reporter: {{data.fields.reporter.displayName}}">R:
                    {{data.fields.reporter.displayName}}</span>
                {{/if}}
                {{#if (settings.renderType, data.fields.issuetype.name)}}
                <span class="tag tag-medium-gray outline" title="Type: {{data.fields.issuetype.name}}">T:
                    {{data.fields.issuetype.name}}</span>
                {{/if}}
                {{#if (settings.renderProgress, progress)}}
                <span class="tag tag-medium-gray outline" title="Progress: {{progress}}">%: {{progress}}</span>
                {{/if}}
                {{#if (settings.renderDueDate, data.fields.duedate)}}
                <span class="tag tag-medium-gray outline" title="Due date: {{data.fields.duedate}}">DD:
                    {{data.fields.duedate}}</span>
                {{/if}}
            </div>
        </details>
        `,

    error: `
        <details class="jira-issue">
            <summary class="flex-center">
                <span class="error-circle">X</span>
                <span>Error</span>
                <span>:</span>
                <span>{{error}}</span>
            </summary>
            <div class="flex-center">
                <span><strong>Query:</strong> {{query}}</span>
            </div>
        </details>
    `,

    searchHead: `
        <div class="jira-search">
            <table>
                <thead>
                    <tr>
                        <th>Key</th>
                        <th>Summary</th>
                        <th>T</th>
                        <th>Created</th>
                        <th>Updated</th>
                        <th>Due</th>
                        <th>Assignee</th>
                        <th>Reporter</th>
                        <th>P</th>
                        <th>Status</th>
                        <th>Resolution</th>
                    </tr>
                </thead>
                <tbody>
    `,

    searchRow: `
        <tr>
            <td>
                <a href="{{settings.jiraHost}}/browse/{{data.key}}">{{data.key}}</a>
            </td>
            <td>
                {{#if (data.fields.summary)}}
                <a href="{{settings.jiraHost}}/browse/{{data.key}}">
                    {{data.fields.summary}}
                </a>
                {{/if}}
            </td>
            <td>
                {{#if (data.fields.issuetype.name)}}
                <a href="{{settings.jiraHost}}/browse/{{data.key}}">
                    <img alt="{{data.fields.issuetype.name}}" title="{{data.fields.issuetype.name}}"
                        src="{{data.fields.issuetype.iconUrl}}" />
                </a>
                {{/if}}
            </td>
            <td>
                {{#if (data.fields.created)}}
                {{data.fields.created}}
                {{/if}}
            </td>
            <td>
                {{#if (data.fields.updated)}}
                {{data.fields.updated}}
                {{/if}}
            </td>
            <td>
                {{#if (data.fields.duedate)}}
                {{data.fields.duedate}}
                {{/if}}
            </td>
            <td>
                {{#if (data.fields.assignee.displayName)}}
                {{data.fields.assignee.displayName}}
                {{/if}}
            </td>
            <td>
                {{#if (data.fields.reporter.displayName)}}
                {{data.fields.reporter.displayName}}
                {{/if}}
            </td>
            <td>
                {{#if (data.fields.priority.name)}}
                <img alt="Priority: {{data.fields.priority.name}}" title="Priority: {{data.fields.priority.name}}"
                    src="{{data.fields.priority.iconUrl}}" />
                {{/if}}
            </td>
            <td class="no-text-wrap">
                <span class="tag uppercase tag-{{statusColor}}">{{data.fields.status.name}}</span>
            </td>
            <td>
                {{#if (data.fields.resolution)}}
                {{data.fields.resolution}}
                {{/if}}
            </td>
        </tr>
    `,

    searchFoot: `
                </tbody>
            </table>
        </div>
    `,
}