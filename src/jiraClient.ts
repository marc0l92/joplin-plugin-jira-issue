import { Settings } from "./settings";

export class JiraClient {
    private _settings: Settings;

    constructor(settings: Settings) {
        this._settings = settings;
    }

    async getIssue(issue: string): Promise<any> {
        const resource: RequestInfo = this._settings.jiraHost + this._settings.apiBasePath + '/issue/' + issue;
        const requestHeaders: HeadersInit = new Headers;
        if (this._settings.username) {
            requestHeaders.set('Authorization', 'Basic ' + btoa(this._settings.username + ':' + this._settings.password));
        }
        const options: RequestInit = {
            method: 'GET',
            headers: requestHeaders,
        }

        let response: Response;
        try {
            response = await fetch(resource, options);
        } catch (e) {
            console.error('JiraClient::getIssue::response', e)
            throw 'Request error';
        }

        if (response.status === 200) {
            // console.info(response);
            try {
                return response.json();
            } catch (e) {
                console.error('JiraClient::getIssue::parsing', response, e);
                throw 'Error: The API response is not a JSON. Please check the host configured in the plugin options.';
            }
        } else {
            console.error('JiraClient::getIssue::error', response);
            let responseJson: any;
            try {
                responseJson = await response.json();
            } catch (e) {
                throw 'Error: ' + response.status;
            }
            throw 'Error: ' + responseJson['errorMessages'].join(', ');
        }
    }

    async getSearchResults(query: string): Promise<any> {
        const resource: RequestInfo = this._settings.jiraHost + this._settings.apiBasePath + '/search';
        const requestHeaders: HeadersInit = new Headers;
        requestHeaders.set('Content-Type', 'application/json');
        if (this._settings.username) {
            requestHeaders.set('Authorization', 'Basic ' + btoa(this._settings.username + ':' + this._settings.password));
        }
        const requestBody: string = JSON.stringify({
            jql: query,
            startAt: 0,
            maxResults: 15,
            fields: [
                "summary",
                "status",
                "assignee"
            ]
        });
        const options: RequestInit = {
            method: 'POST',
            headers: requestHeaders,
            body: requestBody,
            credentials: 'same-origin',
        }
        console.log(options);

        let response: Response;
        try {
            response = await fetch(resource, options);
        } catch (e) {
            console.error('JiraClient::getSearchResults::response', e)
            throw 'Request error';
        }

        if (response.status === 200) {
            // console.info(response);
            try {
                return response.json();
            } catch (e) {
                console.error('JiraClient::getSearchResults::parsing', response, e);
                throw 'Error: The API response is not a JSON. Please check the host configured in the plugin options.';
            }
        } else {
            console.error('JiraClient::getSearchResults::error', response, await response.text());
            let responseJson: any;
            try {
                responseJson = await response.json();
            } catch (e) {
                throw 'Error: ' + response.status;
            }
            throw 'Error: ' + responseJson['errorMessages'].join(', ');
        }
    }

    async updateStatusColorCache(status: any): Promise<void> {
        return new Promise<void>((resolve) => {
            // Check cached status
            if (this._settings.isStatusColorCached(status)) {
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
