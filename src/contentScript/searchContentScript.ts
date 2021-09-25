import * as MarkdownIt from "markdown-it"
import { RenderRule } from "markdown-it/lib/renderer"
import Token = require("markdown-it/lib/token")
import crypto = require('crypto')
import { unpackAttributes } from './contentScriptUtils'

const fenceName = 'jira-search'
const htmlTagRegExp = /<jirasearch +(?<attributes>[^>]+?) *\/?>/

function buildRender(renderer: RenderRule, contentScriptId: string, checkToken: (t: Token) => boolean, extractContent: (t: Token) => string) {
    const defaultRender = renderer || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options)
    }
    return function (tokens, idx, options, env, self) {
        const token = tokens[idx]
        console.debug('token', token, checkToken(token))
        if (!checkToken(token)) return defaultRender(tokens, idx, options, env, self)

        const randomId = crypto.randomBytes(8).toString('hex')
        console.log(`Jira-Search[${randomId}] render markdown-it plugin`)

        const content = JSON.stringify(extractContent(token))

        const sendContentToJoplinPlugin = `
        console.log('Jira-Search[${randomId}] send content:', ${content});
        webviewApi.postMessage('${contentScriptId}', ${content}).then((response) => {
            document.getElementById('jira-search-root-${randomId}').innerHTML = response;
        });
        `.replace(/"/g, '&quot;')

        return `
        <div id="jira-search-root-${randomId}" class="jira-container container-block">
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
}

export default function (context) {
    return {
        plugin: function (markdownIt: MarkdownIt, _options) {
            markdownIt.renderer.rules.fence = buildRender(
                markdownIt.renderer.rules.fence,
                context.contentScriptId,
                t => t.info === fenceName,
                t => t.content
            )
            markdownIt.renderer.rules.html_inline = buildRender(
                markdownIt.renderer.rules.html_inline,
                context.contentScriptId,
                t => htmlTagRegExp.test(t.content.toLowerCase()),
                t => unpackAttributes(t.content.toLowerCase().match(htmlTagRegExp).groups.attributes).jql
            )
            markdownIt.renderer.rules.html_block = buildRender(
                markdownIt.renderer.rules.html_block,
                context.contentScriptId,
                t => htmlTagRegExp.test(t.content.toLowerCase()),
                t => unpackAttributes(t.content.toLowerCase().match(htmlTagRegExp).groups.attributes).jql
            )
        },
        assets: function () {
            return [
                { name: 'style.css' },
            ]
        },
    }
}