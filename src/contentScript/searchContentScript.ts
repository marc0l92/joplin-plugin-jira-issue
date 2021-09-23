import * as MarkdownIt from "markdown-it"
const tokenName = "jira-search"

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
                const token = tokens[idx]
                if (token.info !== tokenName) return defaultRender(tokens, idx, options, env, self)
                console.log(`Jira-Search[${renderIndex}] render markdown-it plugin`)

                renderIndex++
                const content = JSON.stringify(token.content)

                const sendContentToJoplinPlugin = `
                    console.log('Jira-Search[${renderIndex}] send content:', ${content});
                    webviewApi.postMessage('${contentScriptId}', ${content}).then((response) => {
                        document.getElementById('jira-search-root-${renderIndex}').innerHTML = response;
                    });
                `.replace(/"/g, '&quot;')

                return `
                <div id="jira-search-root-${renderIndex}" class="jira-container container-block">
                    <div class="jira-issue flex-center">
                        <div class="lds-dual-ring"></div>
                        <span>-</span>
                        <span>Getting search results...</span>
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