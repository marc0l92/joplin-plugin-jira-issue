// import MarkdownIt = require("markdown-it")
import * as MarkdownIt from "markdown-it"
const tokenName = "jira"

export default function (context) {
    return {
        plugin: function (markdownIt: MarkdownIt, _options) {
            const contentScriptId = context.contentScriptId;
            // const pluginId = context.pluginId;
            console.log("context", context)
            let divIndex = 0

            const defaultRender = markdownIt.renderer.rules.fence || function (tokens, idx, options, env, self) {
                return self.renderToken(tokens, idx, options)
            }

            markdownIt.renderer.rules.fence = function (tokens, idx, options, env, self) {
                const token = tokens[idx]
                if (token.info !== tokenName) return defaultRender(tokens, idx, options, env, self)

                divIndex++
                const content = token.content.trim().replace(/\n/g, ';').replace(/'/g, "\'")

                const sendContentToJoplinPlugin = `
                    console.log('reload', ${divIndex});
                    webviewApi.postMessage('${contentScriptId}', '${content}').then((response) => {
                        console.info('Response-${divIndex}: ' + response);
                    });
                `.replace(/\n/g, ' ').replace(/"/g, '\\"')
                // document.getElementById("jira-issue-root-${divIndex}").innerHTML = response

                return `
                <div id="jira-issue-root-${divIndex}" onReady="alert(${divIndex})">
                    <div class="jira-container">
                        <div class="jira-issue flex-center">
                            <div class="lds-dual-ring"></div>
                            <span id="id1">-</span>
                            <span>Getting issue details...</span>
                            <span class="tag tag-grey outline" title="Status">STATUS</span>
                        </div>
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