import * as MarkdownIt from "markdown-it"
import { buildRender, ContainerType, ElementType, unpackAttributes } from './contentScriptUtils'

const fenceName = 'jira-search'
const htmlTagRegExpMulti = /<jirasearch +(?<attributes>[^>]+?) *\/?>/g
const htmlTagRegExp = /<jirasearch +(?<attributes>[^>]+?) *\/?>/

export default function (context) {
    return {
        plugin: function (markdownIt: MarkdownIt, _options) {
            markdownIt.renderer.rules.fence = buildRender(
                markdownIt.renderer.rules.fence,
                context.contentScriptId,
                ElementType.Search,
                ContainerType.Block,
                t => t.info === fenceName,
                t => t.content
            )
            markdownIt.renderer.rules.html_inline = buildRender(
                markdownIt.renderer.rules.html_inline,
                context.contentScriptId,
                ElementType.Search,
                ContainerType.Block,
                t => htmlTagRegExp.test(t.content.toLowerCase()),
                t => t.content.toLowerCase().match(htmlTagRegExpMulti).map(m => unpackAttributes(m.match(htmlTagRegExp).groups.attributes).jql).join('\n')
            )
            markdownIt.renderer.rules.html_block = buildRender(
                markdownIt.renderer.rules.html_block,
                context.contentScriptId,
                ElementType.Search,
                ContainerType.Block,
                t => htmlTagRegExp.test(t.content.toLowerCase()),
                t => t.content.toLowerCase().match(htmlTagRegExpMulti).map(m => unpackAttributes(m.match(htmlTagRegExp).groups.attributes).jql).join('\n')
            )
        },
        assets: function () {
            return [
                { name: 'style.css' },
            ]
        },
    }
}