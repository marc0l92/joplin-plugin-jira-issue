import * as MarkdownIt from "markdown-it"
const tokenName = "jira"

export default function (context) {
    return {
        plugin: function (markdownIt: MarkdownIt, _options) {
            const contentScriptId = context.contentScriptId;
            // This index is incremented for each render of the plugin
            // and it is used to create a different html id for the components generated
            let renderIndex = 0

            const defaultRender = markdownIt.renderer.rules.fence || function (tokens, idx, options, env, self) {
                return self.renderToken(tokens, idx, options)
            }

            markdownIt.renderer.rules.fence = function (tokens, idx, options, env, self) {
                console.log(`Jira-Issue[${renderIndex}] render markdown-it plugin`)
                const token = tokens[idx]
                if (token.info !== tokenName) return defaultRender(tokens, idx, options, env, self)

                renderIndex++
                const content = token.content.trim().replace(/\n/g, ';').replace(/'/g, "\\'").replace(/"/g, '\\"')

                const sendContentToJoplinPlugin = `
                    console.log('Jira-Issue[${renderIndex}] send content:', '${content}');
                    webviewApi.postMessage('${contentScriptId}', '${content}').then((response) => {
                        document.getElementById('jira-issue-root-${renderIndex}').innerHTML = response;
                    });
                `.replace(/\n/g, ' ')

                return `
                <div id="jira-issue-root-${renderIndex}" class="jira-container">
                    <div class="jira-issue flex-center">
                        <div class="lds-dual-ring"></div>
                        <span>-</span>
                        <span>Getting issue details...</span>
                        <span class="tag tag-grey outline" title="Status">STATUS</span>
                    </div>
                </div>
                <style onload="${sendContentToJoplinPlugin}"></style>
                `
            }
        },
        assets: function () {
            return [
                { name: 'style.css' },
            ]
        },
    }
}