import * as MarkdownIt from "markdown-it"
const tokenName = "jira-issue"

function unpackAttributes(attributesStr: string): any {
    const attributesObj = {}
    while (attributesStr.length > 0) {
        const matches = attributesStr.match(/ *(?<key>[a-z]+)=\"(?<value>[^"]+)\" */)
        if (!matches || !matches.groups) {
            break
        }
        attributesObj[matches.groups.key] = matches.groups.value.replace(/&quot/g, '"')
        attributesStr = attributesStr.slice(matches[0].length)
    }
    return attributesObj
}

export default function (context) {
    return {
        plugin: function (markdownIt: MarkdownIt, _options) {
            const contentScriptId = context.contentScriptId;
            // This index is incremented for each render of the plugin
            // and it is used to create a different html id for the components generated
            let renderIndex = 0

            const defaultFenceRender = markdownIt.renderer.rules.fence || function (tokens, idx, options, env, self) {
                return self.renderToken(tokens, idx, options)
            }
            markdownIt.renderer.rules.fence = function (tokens, idx, options, env, self) {
                const token = tokens[idx]
                if (token.info !== tokenName) return defaultFenceRender(tokens, idx, options, env, self)
                renderIndex++
                // console.log(`Jira-Issue[${renderIndex}] render markdown-it plugin fence`)

                const content = JSON.stringify(token.content)

                const sendContentToJoplinPlugin = `
                    console.log('Jira-Issue[${renderIndex}] send content:', ${content});
                    webviewApi.postMessage('${contentScriptId}', ${content}).then((response) => {
                        document.getElementById('jira-issue-root-${renderIndex}').innerHTML = response;
                    });
                `.replace(/"/g, '&quot;')

                return `
                <div id="jira-issue-root-${renderIndex}" class="jira-container container-block">
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

            const defaultHtmlInlineRender = markdownIt.renderer.rules.html_inline || function (tokens, idx, options, env, self) {
                return self.renderToken(tokens, idx, options)
            }
            markdownIt.renderer.rules.html_inline = function (tokens, idx, options, env, self) {
                const token = tokens[idx]
                console.log('html_inline', idx, tokens)
                const matches = token.content.toLowerCase().match(/<jiraissue +(?<attributes>[^>]+?) *\/?>/)
                if (!matches || !matches.groups) return defaultHtmlInlineRender(tokens, idx, options, env, self)
                renderIndex++
                console.log(`Jira-Issue[${renderIndex}] render markdown-it plugin html_inline`)

                const attributes = unpackAttributes(matches.groups.attributes)

                const content = JSON.stringify(attributes.key)

                const sendContentToJoplinPlugin = `
                    console.log('Jira-Issue[${renderIndex}] send content:', ${content});
                    webviewApi.postMessage('${contentScriptId}', ${content}).then((response) => {
                        document.getElementById('jira-issue-root-${renderIndex}').innerHTML = response;
                    });
                `.replace(/"/g, '&quot;')

                return `
                <div id="jira-issue-root-${renderIndex}" class="jira-container container-inline">
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