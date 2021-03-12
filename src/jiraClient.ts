import { Settings } from "./settings";

export class JiraClient {
    private _settings: Settings;

    constructor(settings: Settings) {
        this._settings = settings;
    }

    async getIssue(issue: string): Promise<any> {
        const url: URL = new URL(this._settings.jiraHost + this._settings.apiBasePath + '/issue/' + issue);
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
            response = await fetch(url.toString(), options);
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

    async getSearchResults(query: string, max: number): Promise<any> {
        const url: URL = new URL(this._settings.jiraHost + this._settings.apiBasePath + '/search');
        const requestHeaders: HeadersInit = new Headers;
        if (this._settings.username) {
            requestHeaders.set('Authorization', 'Basic ' + btoa(this._settings.username + ':' + this._settings.password));
        }
        const queryParameters = new URLSearchParams({
            jql: query,
            startAt: "0",
            maxResults: max.toString(),
        });
        url.search = queryParameters.toString();
        const options: RequestInit = {
            method: 'GET',
            headers: requestHeaders,
        }

        let response: Response;
        try {
            response = await fetch(url.toString(), options);
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
        // Check cached status
        if (this._settings.isStatusColorCached(status)) {
            return;
        }

        // Request the status color using the API
        const url: URL = new URL(this._settings.jiraHost + this._settings.apiBasePath + '/status/' + status);
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
            response = await fetch(url.toString(), options);
        } catch (e) {
            console.error('JiraClient::getIssue::response', e)
            throw 'Request error';
        }

        if (response.status === 200) {
            // console.info(response);
            try {
                const responseJson = await response.json();
                this._settings.addStatusColor(status, responseJson.statusCategory.colorName);
                return;
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
}
