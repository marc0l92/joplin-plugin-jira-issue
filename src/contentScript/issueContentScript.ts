import * as MarkdownIt from "markdown-it"
import { unpackAttributes, buildRender, ElementType, ContainerType } from './contentScriptUtils'

const fenceNameRegExp = /jira-?issue/i
const htmlTagRegExpMulti = /<jiraissue +(?<attributes>[^>]+?) *\/?>/gi
const htmlTagRegExp = /<jiraissue +(?<attributes>[^>]+?) *\/?>/i
const extraTextRegExp = /.*<jiraissue +[^>]+? *\/?>(?<extraText>.*)/i

export default function (context) {
    return {
        plugin: function (markdownIt: MarkdownIt, _options) {
            markdownIt.renderer.rules.fence = buildRender(
                markdownIt.renderer.rules.fence,
                context.contentScriptId,
                ElementType.Issue,
                ContainerType.Block,
                t => fenceNameRegExp.test(t.info),
                t => t.content
            )
            markdownIt.renderer.rules.html_inline = buildRender(
                markdownIt.renderer.rules.html_inline,
                context.contentScriptId,
                ElementType.Issue,
                ContainerType.Inline,
                t => htmlTagRegExp.test(t.content),
                t => t.content.match(htmlTagRegExpMulti).map(m => unpackAttributes(m.match(htmlTagRegExp).groups.attributes).key).join('\n')
            )
            markdownIt.renderer.rules.html_block = buildRender(
                markdownIt.renderer.rules.html_block,
                context.contentScriptId,
                ElementType.Issue,
                ContainerType.Inline,
                t => htmlTagRegExp.test(t.content),
                t => t.content.match(htmlTagRegExpMulti).map(m => unpackAttributes(m.match(htmlTagRegExp).groups.attributes).key).join('\n'),
                t => t.content.replace(/\n/g,'').match(extraTextRegExp).groups.extraText
            )
        },
        assets: function () {
            return [
                { name: 'style.css' },
            ]
        },
    }
}