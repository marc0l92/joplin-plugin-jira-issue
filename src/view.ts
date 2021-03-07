import { Settings } from "./settings";

export class View {
    private _settings: Settings;

    constructor(settings: Settings) {
        this._settings = settings;
    }

    private renderIssueAsText(apiResponse: any): string {
        // Properties
        let props = [];
        if (this._settings.renderPriority) {
            props.push(`P: ${apiResponse.fields.priority.name}`);
        }
        if (this._settings.renderCreator) {
            props.push(`C: ${apiResponse.fields.creator.displayName}`);
        }
        if (this._settings.renderReporter) {
            props.push(`R: ${apiResponse.fields.reporter.displayName}`);
        }
        if (this._settings.renderType) {
            props.push(`T: ${apiResponse.fields.issuetype.name}`);
        }

        // Output string
        let out = '';
        if (this._settings.renderTypeIcon) {
            out += `![${apiResponse.fields.issuetype.name}](${apiResponse.fields.issuetype.iconUrl})`;
        }
        if (this._settings.renderKey) {
            out += ` [${apiResponse.key}](${this._settings.jiraHost}/browse/${apiResponse.key})`;
        }
        if (this._settings.renderStatus) {
            out += ` \`${apiResponse.fields.status.name}\``;
        }
        if (this._settings.renderSummary) {
            out += ` _${apiResponse.fields.summary}_`;
        }
        if (this._settings.renderProgress) {
            if (apiResponse.fields.aggregateprogress.percent) {
                out += `[${apiResponse.fields.aggregateprogress.percent}%]`;
            } else if (apiResponse.fields.aggregateprogress.total > 0) {
                out += `[${apiResponse.fields.aggregateprogress.progress / apiResponse.fields.aggregateprogress.total * 100}]`;
            }
        }
        if (props.length > 0) {
            out += '<br/>[' + props.join('; ') + ']';
        }
        return out.trim();
    }

    private async renderIssueWithBadges(apiResponse: any): Promise<string> {
        // Properties
        let props = [];
        if (this._settings.renderPriority) {
            props.push(`![P: ${apiResponse.fields.priority.name}](https://img.shields.io/badge/P-${encodeURI(apiResponse.fields.priority.name)}-lightgray)`);
        }
        if (this._settings.renderCreator) {
            props.push(`![C: ${apiResponse.fields.creator.displayName}](https://img.shields.io/badge/C-${encodeURI(apiResponse.fields.creator.displayName)}-lightgray)`);
        }
        if (this._settings.renderReporter) {
            props.push(`![R: ${apiResponse.fields.reporter.displayName}](https://img.shields.io/badge/R-${encodeURI(apiResponse.fields.reporter.displayName)}-lightgray)`);
        }
        if (this._settings.renderType) {
            props.push(`![T: ${apiResponse.fields.issuetype.name}](https://img.shields.io/badge/T-${encodeURI(apiResponse.fields.issuetype.name)}-lightgray)`);
        }

        // Output string
        let out = '';
        if (this._settings.renderTypeIcon) {
            out += `![${apiResponse.fields.issuetype.name}](${apiResponse.fields.issuetype.iconUrl})`;
        }
        if (this._settings.renderKey) {
            out += ` [${apiResponse.key}](${this._settings.jiraHost}/browse/${apiResponse.key})`;
        }
        if (this._settings.renderStatus) {
            const statusColor = await this._settings.getStatusColor(apiResponse.fields.status.name);
            out += ` ![${apiResponse.fields.status.name}](https://img.shields.io/badge/-${encodeURI(apiResponse.fields.status.name)}-${statusColor})`;
        }
        if (this._settings.renderSummary) {
            out += ` _${apiResponse.fields.summary}_`;
        }

        if (this._settings.renderProgress) {
            if (apiResponse.fields.aggregateprogress.percent) {
                out += ` [${apiResponse.fields.aggregateprogress.percent}%]`;
            } else if (apiResponse.fields.aggregateprogress.total > 0) {
                out += ` [${apiResponse.fields.aggregateprogress.progress / apiResponse.fields.aggregateprogress.total * 100}]`;
            }
        }
        if (props.length > 0) {
            out += '<br/>' + props.join(' ');
        }
        return out.trim();
    }

    async renderIssue(apiResponse: any): Promise<string> {
        if (this._settings.useBadges) {
            return await this.renderIssueWithBadges(apiResponse);
        } else {
            return this.renderIssueAsText(apiResponse);
        }
    }
}
