const tokenName = "jira"
// let settings = {} // shared across all the instance of jira across all the notes

export default function (context) {
    return {
        plugin: function (markdownIt, _options) {
            const pluginId = context.pluginId

            const defaultRender = markdownIt.renderer.rules.fence || function (tokens, idx, options, env, self) {
                return self.renderToken(tokens, idx, options, env, self)
            }

            markdownIt.renderer.rules.fence = function (tokens, idx, options, env, self) {
                const token = tokens[idx]
                if (token.info !== tokenName) return defaultRender(tokens, idx, options, env, self)
                // token.content.trim()

                // const postMessageWithResponseTest = `
                //     webviewApi.postMessage('${pluginId}', 'justtesting').then(function(response) {
                //         console.info('Got response in content script: ' + response)
                //     })
                //     return false
                // `
                console.log("ciao")

                return `
                <div class="jira-container">
                    <details class="jira-issue">
                        <summary class="flex-center">
                            <a href="https://jira.secondlife.com/browse/OPEN-83" class="flex-center">
                                <img alt="Sub-task" title="Sub-task"
                                    src="https://jira.secondlife.com/secure/viewavatar?size=xsmall&avatarId=13926&avatarType=issuetype" />
                                <span>OPEN-83</span>
                            </a>
                            <span>-</span>
                            <span>3p-qt Correction Tracking</span>
                            <span class="tag tag-blue" title="Status">IN PROGRESS</span>
                        </summary>
                        <div class="flex-center">
                            <span class="tag tag-grey" title="Reporter: Paras Kumar">E: Paras KUMAR</span>
                            <span class="tag tag-grey" title="Reporter: Paras Kumar">E: Paras KUMAR</span>
                        </div>
                    </details>
                </div>
                `
            }
        },
        assets: function () {
            return [
                { name: 'markdownItPlugin.css' }
            ]
        },
    }
}