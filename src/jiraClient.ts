// Markdown table formula calculator.
export class JiraClient {
    host: string = 'https://issues.apache.org/jira'
    apiBasePath: string = '/rest/api/latest/issue/'

    async query(issue: string): Promise<string> {
        return new Promise<string>((resolve) => {
            console.log("url", this.host, this.apiBasePath, issue)
            var xhr = new XMLHttpRequest();
            xhr.open("GET", this.host + this.apiBasePath + issue, true);
            xhr.onload = (e) => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        console.log(xhr.responseText);
                        const response = JSON.parse(xhr.responseText);
                        resolve(response.fields.status.name);
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
