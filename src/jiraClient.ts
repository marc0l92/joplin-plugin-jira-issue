import { Settings } from "./settings";

export class JiraClient {
    private _settings: Settings;

    constructor(settings: Settings) {
        this._settings = settings;
    }

    async getIssue(issue: string): Promise<any> {
        return new Promise<string>((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            // console.info("JiraIssue::getIssue: ", this._settings.jiraHost, this._settings.apiBasePath, '/issue/', issue)
            xhr.open("GET", this._settings.jiraHost + this._settings.apiBasePath + '/issue/' + issue, true);
            if (this._settings.username) {
                xhr.setRequestHeader('Authorization', 'Basic ' + btoa(this._settings.username + ':' + this._settings.password));
            }
            xhr.onload = (e) => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        // console.info(xhr.responseText);
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        console.error(xhr.statusText);
                        reject('Error: ' + xhr.status);
                    }
                }
            };
            xhr.onerror = (e) => {
                console.error("onerror", e)
                reject('Request error');
            }
            xhr.send(null);
        })
    }

    async updateStatusColorCache(status: any): Promise<void> {
        return new Promise<void>((resolve) => {
            // Check cached status
            if(this._settings.isStatusColorCached(status)){
                return resolve();
            }
            // Request the status color using the API
            let xhr = new XMLHttpRequest();
            xhr.open("GET", this._settings.jiraHost + this._settings.apiBasePath + '/status/' + status, true);
            if (this._settings.username) {
                xhr.setRequestHeader('Authorization', 'Basic ' + btoa(this._settings.username + ':' + this._settings.password));
            }
            xhr.onload = (e) => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        // console.info(xhr.responseText);
                        const responseJson = JSON.parse(xhr.responseText);
                        this._settings.addStatusColor(status, responseJson.statusCategory.colorName);
                    } else {
                        console.error(xhr.statusText);
                    }
                    return resolve();
                }
            };
            xhr.onerror = (e) => {
                console.error("updateStatusColorCache -> onerror", e)
                return resolve();
            }
            xhr.send(null);
        })
    }
}
