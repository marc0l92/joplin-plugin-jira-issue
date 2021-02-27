import { Settings } from "./settings";

// Markdown table formula calculator.
export class JiraClient {
    private _settings: Settings;

    constructor(settings: Settings) {
        this._settings = settings;
    }

    render(apiResponse: any): string {
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
        if (this._settings.renderCode) {
            out += `[[${apiResponse.key}](${this._settings.jiraHost}/browse/${apiResponse.key})]`;
        }
        if (props.length > 0) {
            out += '[' + props.join('; ') + ']';
        }

        if (this._settings.renderProgress) {
            out += `[${apiResponse.fields.aggregateprogress.percent}%]`;
        }
        if (this._settings.renderStatus) {
            out += `[${apiResponse.fields.status.name}]`;
        }
        if (this._settings.renderSummary) {
            out += ` _${apiResponse.fields.summary}_`;
        }
        return out.trim();
    }

    async query(issue: string): Promise<string> {
        return new Promise<string>((resolve) => {
            console.info("JiraIssue: query ", this._settings.jiraHost, this._settings.apiBasePath, issue)
            var xhr = new XMLHttpRequest();
            xhr.open("GET", this._settings.jiraHost + this._settings.apiBasePath + issue, true);
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
