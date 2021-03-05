import { Settings } from "./settings";

export class JiraClient {
    private _settings: Settings;
    private _colorsMap: Object = {
        'default': 'lightgrey',
        'blue-gray': 'blue',
        'yellow': 'yellow',
        'green': 'green',
        'medium-gray': 'lightgrey',
    };

    constructor(settings: Settings) {
        this._settings = settings;
    }

    getMappedColor(jiraColor: string = 'default'): string {
        if (jiraColor in this._colorsMap) {
            return this._colorsMap[jiraColor];
        }
        return this._colorsMap['default']
    }

    renderAsText(apiResponse: any): string {
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

    async renderWithBadges(apiResponse: any): Promise<string> {
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
            const statusColor = await this.getStatusColor(apiResponse.fields.status.name);
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

    async render(apiResponse: any): Promise<string> {
        if (this._settings.useBadges) {
            return await this.renderWithBadges(apiResponse);
        } else {
            return this.renderAsText(apiResponse);
        }
    }

    async query(issue: string): Promise<string> {
        return new Promise<string>((resolve) => {
            // console.info("JiraIssue: query ", this._settings.jiraHost, this._settings.apiBasePath, issue)
            let xhr = new XMLHttpRequest();
            xhr.open("GET", this._settings.jiraHost + this._settings.apiBasePath + '/issue/' + issue, true);
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

    async getStatusColor(status: string): Promise<string> {
        return new Promise<string>((resolve) => {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", this._settings.jiraHost + this._settings.apiBasePath + '/status/' + status, true);
            if (this._settings.username) {
                xhr.setRequestHeader('Authorization', 'Basic ' + btoa(this._settings.username + ':' + this._settings.password));
            }
            xhr.onload = (e) => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        console.log(xhr.responseText);
                        const responseJson = JSON.parse(xhr.responseText);
                        resolve(this.getMappedColor(responseJson.statusCategory.colorName));
                    } else {
                        console.error(xhr.statusText);
                        resolve(this.getMappedColor());
                    }
                }
            };
            xhr.onerror = (e) => {
                console.log("onerror", e)
                resolve(this.getMappedColor());
            }
            xhr.send(null);
        })
    }
}
