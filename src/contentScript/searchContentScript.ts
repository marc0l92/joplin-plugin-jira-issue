import * as MarkdownIt from "markdown-it"
import { buildRender, ContainerType, ElementType, unpackAttributes } from './contentScriptUtils'

const fenceNameRegExp = /jira-?search/i
const htmlTagRegExpMulti = /<jirasearch +(?<attributes>[^>]+?) *\/?>/gi
const htmlTagRegExp = /<jirasearch +(?<attributes>[^>]+?) *\/?>/i
const extraTextRegExp = /.*<jirasearch +[^>]+? *\/?>(?<extraText>.*)/i

export default function (context) {
    return {
        plugin: function (markdownIt: MarkdownIt, _options) {
            markdownIt.renderer.rules.fence = buildRender(
                markdownIt.renderer.rules.fence,
                context.contentScriptId,
                ElementType.Search,
                ContainerType.Block,
                t => fenceNameRegExp.test(t.info),
                t => t.content
            )
            markdownIt.renderer.rules.html_inline = buildRender(
                markdownIt.renderer.rules.html_inline,
                context.contentScriptId,
                ElementType.Search,
                ContainerType.Block,
                t => htmlTagRegExp.test(t.content),
                t => t.content.match(htmlTagRegExpMulti).map(m => unpackAttributes(m.match(htmlTagRegExp).groups.attributes).jql).join('\n')
            )
            markdownIt.renderer.rules.html_block = buildRender(
                markdownIt.renderer.rules.html_block,
                context.contentScriptId,
                ElementType.Search,
                ContainerType.Block,
                t => htmlTagRegExp.test(t.content),
                t => t.content.match(htmlTagRegExpMulti).map(m => unpackAttributes(m.match(htmlTagRegExp).groups.attributes).jql).join('\n'),
                t => t.content.replace(/\n/g, '').match(extraTextRegExp).groups.extraText
            )
        },
        assets: function () {
            return [
                { name: 'style.css' },
            ]
        },
    }
}