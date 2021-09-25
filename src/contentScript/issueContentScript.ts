import * as MarkdownIt from "markdown-it"
import { unpackAttributes, buildRender, ElementType, ContainerType } from './contentScriptUtils'

const fenceName = 'jira-issue'
const htmlTagRegExp = /<jiraissue +(?<attributes>[^>]+?) *\/?>/

export default function (context) {
    return {
        plugin: function (markdownIt: MarkdownIt, _options) {
            markdownIt.renderer.rules.fence = buildRender(
                markdownIt.renderer.rules.fence,
                context.contentScriptId,
                ElementType.Issue,
                ContainerType.Block,
                t => t.info === fenceName,
                t => t.content
            )
            markdownIt.renderer.rules.html_inline = buildRender(
                markdownIt.renderer.rules.html_inline,
                context.contentScriptId,
                ElementType.Issue,
                ContainerType.Inline,
                t => htmlTagRegExp.test(t.content.toLowerCase()),
                t => unpackAttributes(t.content.toLowerCase().match(htmlTagRegExp).groups.attributes).key
            )
            markdownIt.renderer.rules.html_block = buildRender(
                markdownIt.renderer.rules.html_block,
                context.contentScriptId,
                ElementType.Issue,
                ContainerType.Inline,
                t => htmlTagRegExp.test(t.content.toLowerCase()),
                t => unpackAttributes(t.content.toLowerCase().match(htmlTagRegExp).groups.attributes).key
            )
        },
        assets: function () {
            return [
                { name: 'style.css' },
            ]
        },
    }
}