import { Settings } from "./settings";

export class JiraClient {
    private _settings: Settings;

    constructor(settings: Settings) {
        this._settings = settings;
    }

    renderAsText(apiResponse: any): string {
        // Properties
        let props = [];
        if (this._settings.renderPriority) {
            props.push(`Priority: ${apiResponse.fields.priority.name}`);
        }
        if (this._settings.renderCreator) {
            props.push(`Creator: ${apiResponse.fields.creator.displayName}`);
        }
        if (this._settings.renderReporter) {
            props.push(`Reporter: ${apiResponse.fields.reporter.displayName}`);
        }
        if (this._settings.renderType) {
            props.push(`Type: ${apiResponse.fields.issuetype.name}`);
        }

        // Output string
        let out = '';
        if (this._settings.renderTypeIcon) {
            out += `![${apiResponse.fields.issuetype.name}](${apiResponse.fields.issuetype.iconUrl})`;
        }
        if (this._settings.renderKey) {
            out += ` [[${apiResponse.key}](${this._settings.jiraHost}/browse/${apiResponse.key})]`;
        }
        if (props.length > 0) {
            out += '[' + props.join('; ') + ']';
        }

        if (this._settings.renderProgress) {
            if (apiResponse.fields.aggregateprogress.percent) {
                out += `[${apiResponse.fields.aggregateprogress.percent}%]`;
            } else {
                out += `[${apiResponse.fields.aggregateprogress.progress}/${apiResponse.fields.aggregateprogress.total}]`;
            }
        }
        if (this._settings.renderStatus) {
            out += ` \`${apiResponse.fields.status.name}\``;
        }
        if (this._settings.renderSummary) {
            out += ` _${apiResponse.fields.summary}_`;
        }
        return out.trim();
    }

    urlEncode(x: string): string {
        return x;
    }

    renderWithBadges(apiResponse: any): string {
        // Properties
        let props = [];
        if (this._settings.renderPriority) {
            props.push(`![](https://img.shields.io/badge/Priority-${this.urlEncode(apiResponse.fields.priority.name)}-lightgray)`);
        }
        if (this._settings.renderCreator) {
            props.push(`Creator: ${apiResponse.fields.creator.displayName}`);
        }
        if (this._settings.renderReporter) {
            props.push(`Reporter: ${apiResponse.fields.reporter.displayName}`);
        }
        if (this._settings.renderType) {
            props.push(`Type: ${apiResponse.fields.issuetype.name}`);
        }

        // Output string
        let out = '';
        if (this._settings.renderTypeIcon) {
            out += `![${apiResponse.fields.issuetype.name}](${apiResponse.fields.issuetype.iconUrl})`;
        }
        if (this._settings.renderKey) {
            out += ` [[${apiResponse.key}](${this._settings.jiraHost}/browse/${apiResponse.key})]`;
        }
        if (props.length > 0) {
            out += '[' + props.join('; ') + ']';
        }

        if (this._settings.renderProgress) {
            if (apiResponse.fields.aggregateprogress.percent) {
                out += `[${apiResponse.fields.aggregateprogress.percent}%]`;
            } else {
                out += `[${apiResponse.fields.aggregateprogress.progress}/${apiResponse.fields.aggregateprogress.total}]`;
            }
        }
        if (this._settings.renderStatus) {
            out += ` \`${apiResponse.fields.status.name}\``;
        }
        if (this._settings.renderSummary) {
            out += ` _${apiResponse.fields.summary}_`;
        }
        return out.trim();
    }

    render(apiResponse: any): string {
        if (this._settings.useBadges) {
            return this.renderWithBadges(apiResponse);
        } else {
            return this.renderAsText(apiResponse);
        }
    }

    async query(issue: string): Promise<string> {
        return new Promise<string>((resolve) => {
            // console.info("JiraIssue: query ", this._settings.jiraHost, this._settings.apiBasePath, issue)
            let xhr = new XMLHttpRequest();
            xhr.open("GET", this._settings.jiraHost + this._settings.apiBasePath + issue, true);
            if (this._settings.username) {
                xhr.setRequestHeader('Authorization', 'Basic ' + btoa(this._settings.username + ':' + this._settings.password));
            }
            xhr.onload = (e) => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        console.log(xhr.responseText);
                        const responseJson = JSON.parse(xhr.responseText);
                        resolve(this.render(responseJson));
                    } else {
                        console.error(xhr.statusText);
                        resolve('Error: ' + xhr.status);
                    }
                }
            };
            xhr.onerror = (e) => {
                console.log("onerror", e)
                resolve('Request error');
            }
            xhr.send(null);
        })
    }
}
