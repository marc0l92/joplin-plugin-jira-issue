import { RenderRule } from "markdown-it/lib/renderer"
import Token = require("markdown-it/lib/token")
import crypto = require('crypto')

export enum ElementType {
    Issue = 'issue',
    Search = 'search',
}

export enum ContainerType {
    Inline = 'inline',
    Block = 'block',
}

export function unpackAttributes(attributesStr: string): any {
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

export function buildRender(renderer: RenderRule, contentScriptId: string, elementType: ElementType, containerType: ContainerType, checkToken: (t: Token) => boolean, extractContent: (t: Token) => string) {
    const defaultRender = renderer || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options)
    }
    return function (tokens, idx, options, env, self) {
        const token = tokens[idx]
        console.log('token', token, checkToken(token))
        if (!checkToken(token)) return defaultRender(tokens, idx, options, env, self)

        const randomId = crypto.randomBytes(8).toString('hex')
        console.log(`jira-${elementType}[${randomId}] render markdown-it plugin`)

        const content = JSON.stringify(extractContent(token))

        const sendContentToJoplinPlugin = `
        console.log('jira-${elementType}[${randomId}] send content:', ${content});
        webviewApi.postMessage('${contentScriptId}', ${content}).then((response) => {
            document.getElementById('jira-${elementType}-root-${randomId}').innerHTML = response;
        });
        `.replace(/"/g, '&quot;')

        return `
        <div id="jira-${elementType}-root-${randomId}" class="jira-container container-${containerType}">
            <div class="jira-${elementType} flex-center">
                <div class="lds-dual-ring"></div>
                <span>-</span>
                <span>Getting ${elementType} details...</span>
                <span class="tag tag-grey outline" title="Status">STATUS</span>
            </div>
        </div>
        <style onload="${sendContentToJoplinPlugin}"></style>
        `
    }
}