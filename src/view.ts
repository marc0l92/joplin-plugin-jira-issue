import * as Templater from 'templater.js'
import { Settings } from "./settings"

function getDate(dateTime: string): string {
    return dateTime.replace(/T.*/, '')
}

function getIssueProperties(issue: any, settings: Settings): any {
    let progress
    if (issue.fields.aggregateprogress.percent) {
        progress = issue.fields.aggregateprogress.percent
    } else if (issue.fields.aggregateprogress.total > 0) {
        progress = issue.fields.aggregateprogress.progress / issue.fields.aggregateprogress.total * 100
    }

    return {
        key: issue.key,
        jiraHost: settings.get('jiraHost'),
        summary: issue.fields.summary,
        issueType: (issue.fields.issuetype) ? {
            name: issue.fields.issuetype.name,
            icon: issue.fields.issuetype.iconUrl,
        } : null,
        created: (issue.fields.created) ? {
            dateTime: issue.fields.created,
            date: getDate(issue.fields.created)
        } : null,
        updated: (issue.fields.updated) ? {
            dateTime: issue.fields.updated,
            date: getDate(issue.fields.updated)
        } : null,
        dueDate: (issue.fields.duedate) ? {
            dateTime: issue.fields.duedate,
            date: getDate(issue.fields.duedate)
        } : null,
        creator: (issue.fields.creator) ? issue.fields.creator.displayName : null,
        reporter: (issue.fields.reporter) ? issue.fields.reporter.displayName : null,
        assignee: (issue.fields.assignee) ? issue.fields.assignee.displayName : null,
        priority: (issue.fields.priority && issue.fields.priority.id != "6") ? {
            name: issue.fields.priority.name,
            icon: issue.fields.priority.iconUrl,
        } : null,
        status: (issue.fields.status) ? {
            name: issue.fields.status.name,
            color: settings.getStatusColor(issue.fields.status.name),
        } : null,
        resolution: issue.fields.resolution,
        progress: progress,
    }
}

function buildTableHeader(template: string): string {
    let outputHtml = ''
    for (let i = 0; i < template.length; i++) {
        outputHtml += '<th>' + Templates.searchColumns[template[i]].title + '</th>'
    }
    return outputHtml
}

function buildTableRow(template: string, issueProperties: any): string {
    let outputHtml = ''
    for (let i = 0; i < template.length; i++) {
        const columnHtmlTemplate = Templater(Templates.searchColumns[template[i]].body)
        const attributes = Templates.searchColumns[template[i]].noTextWrap ? 'class="no-text-wrap"' : ''
        outputHtml += `<td ${attributes}>` + columnHtmlTemplate(issueProperties) + '</td>'
    }
    return outputHtml
}

export class View {
    private _settings: Settings

    constructor(settings: Settings) {
        this._settings = settings
    }

    renderSearchResults(searchResultsJson: any): string {
        // console.log('renderSearchResults', searchResultsJson, this._settings)
        let outputHtml = Templates.searchHead[0]
            + buildTableHeader(this._settings.get('searchTemplate'))
            + Templates.searchHead[1]

        for (let i in searchResultsJson.issues) {
            const issue = searchResultsJson.issues[i]
            outputHtml += '<tr>'
                + buildTableRow(this._settings.get('searchTemplate'), getIssueProperties(issue, this._settings))
                + '</tr>'
        }

        return outputHtml + Templates.searchFoot
    }

    renderIssue(issue: any): string {
        // console.log('renderIssue', issue, this._settings)
        const htmlTemplate = Templater(Templates.issue)
        return htmlTemplate(getIssueProperties(issue, this._settings))
    }

    renderError(query: string, error: string): string {
        // console.log('renderError', query, error)
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
                <a href="{{jiraHost}}/browse/{{key}}" class="flex-center">
                    {{#if (issueType)}}
                    <img alt="{{issueType.name}}" title="{{issueType.name}}"
                        src="{{issueType.icon}}" />
                    {{/if}}
                    <span>{{key}}</span>
                </a>
                {{#if (summary)}}
                <span class="hide-inline">-</span>
                <span class="hide-inline">{{summary}}</span>
                {{/if}}
                {{#if (status)}}
                <span class="tag uppercase tag-{{status.color}}" title="Status: {{status.name}}">{{status.name}}</span>
                {{/if}}
            </summary>
            <div class="flex-center">
                <span class="tag tag-medium-gray outline hide-block" title="Summary: {{summary}}">S: {{summary}}</span>
                {{#if (priority)}}
                <span class="tag tag-medium-gray outline" title="Priority: {{priority.name}}">P:
                    {{priority.name}}</span>
                {{/if}}
                {{#if (creator)}}
                <span class="tag tag-medium-gray outline" title="Creator: {{creator}}">C:
                    {{creator}}</span>
                {{/if}}
                {{#if (reporter)}}
                <span class="tag tag-medium-gray outline" title="Reporter: {{reporter}}">R:
                    {{reporter}}</span>
                {{/if}}
                {{#if (assignee)}}
                <span class="tag tag-medium-gray outline" title="Assignee: {{assignee}}">A:
                    {{assignee}}</span>
                {{/if}}
                {{#if (issueType)}}
                <span class="tag tag-medium-gray outline" title="Type: {{issueType.name}}">T:
                    {{issueType.name}}</span>
                {{/if}}
                {{#if (progress)}}
                <span class="tag tag-medium-gray outline" title="Progress: {{progress}}">%: {{progress}}</span>
                {{/if}}
                {{#if (dueDate)}}
                <span class="tag tag-medium-gray outline" title="Due date: {{dueDate}}">DD:
                    {{dueDate}}</span>
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

    searchHead: [`
        <div class="jira-search">
            <table>
                <thead>
                    <tr>`, `</tr>
                </thead>
                <tbody>
    `],
    searchColumns: {
        'k': {
            title: 'Key',
            body: `<a href="{{jiraHost}}/browse/{{key}}">{{key}}</a>`,
        },
        'u': {
            title: 'Summary',
            body: `
            {{#if (summary)}}
            <a href="{{jiraHost}}/browse/{{key}}">{{summary}}</a>
            {{/if}}`,
        },
        't': {
            title: 'T',
            body: `
            {{#if (issueType)}}
            <a href="{{jiraHost}}/browse/{{key}}">
                <img alt="{{issueType.name}}" title="{{issueType.name}}"
                    src="{{issueType.icon}}" />
            </a>
            {{/if}}`,
        },
        '<': {
            title: 'Created',
            body: `
            {{#if (created)}}
            <span title="{{created.dateTime}}">{{created.date}}</span>
            {{/if}}`,
        },
        '>': {
            title: 'Updated',
            body: `
            {{#if (updated)}}
            <span title="{{updated.dateTime}}">{{updated.date}}</span>
            {{/if}}`,
        },
        'd': {
            title: 'DueDate',
            body: `
            {{#if (dueDate)}}
            <span title="{{dueDate.dateTime}}">{{dueDate.date}}</span>
            {{/if}}`,
        },
        'c': {
            title: 'Creator',
            body: `
            {{#if (creator)}}
            {{creator}}
            {{/if}}`,
        },
        'r': {
            title: 'Reporter',
            body: `
            {{#if (reporter)}}
            {{reporter}}
            {{/if}}`,
        },
        'a': {
            title: 'Assignee',
            body: `
            {{#if (assignee)}}
            {{assignee}}
            {{/if}}`,
        },
        'p': {
            title: 'P',
            body: `
            {{#if (priority)}}
            <img alt="Priority: {{priority.name}}" title="Priority: {{priority.name}}"
                src="{{priority.icon}}" />
            {{/if}}`,
        },
        's': {
            title: 'Status',
            body: `
            {{#if (status)}}
            <span class="tag uppercase tag-{{status.color}}">{{status.name}}</span>
            {{/if}}`,
            noTextWrap: true,
        },
        'e': {
            title: 'Resolution',
            body: `
            {{#if (resolution)}}
            {{resolution}}
            {{/if}}`,
        },
    },

    searchFoot: `
                </tbody>
            </table>
        </div>
    `,
}