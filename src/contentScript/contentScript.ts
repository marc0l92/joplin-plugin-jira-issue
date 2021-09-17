const tokenName = "jira"

export default function (context) {
    return {
        plugin: function (markdownIt, _options) {
            const contentScriptId = context.contentScriptId;
            console.log("context", context)
            let divIndex = 0

            const defaultRender = markdownIt.renderer.rules.fence || function (tokens, idx, options, env, self) {
                return self.renderToken(tokens, idx, options, env, self)
            }

            markdownIt.renderer.rules.fence = function (tokens, idx, options, env, self) {
                const token = tokens[idx]
                if (token.info !== tokenName) return defaultRender(tokens, idx, options, env, self)

                divIndex++
                const content = token.content.trim().replace(/\n/g, ';')
                return `
                <div id="jira-issue-root-${divIndex}">
                    <div class="jira-container">
                        <div class="jira-issue flex-center">
                            <div class="lds-dual-ring"></div>
                            <span>-</span>
                            <span>Getting issue details...</span>
                            <span class="tag tag-grey outline" title="Status">STATUS</span>
                        </div>
                    </div>
                </div>
                <script>
                    console.log("reload", ${divIndex})
                    webviewApi.postMessage('${contentScriptId}', '${content}').then(function(response) {
                        console.log("jira-issue-root-${divIndex}", response)
                        // document.getElementById("jira-issue-root-${divIndex}").innerHTML = response
                    })
                </script>
                `
            }
        },
        assets: function () {
            return [
                { name: 'style.css' },
                // { name: 'markdownItPluginController.js' },
            ]
        },
    }
}