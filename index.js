const shiki = require('@mgtd/shiki')
const { commonLangIds, commonLangAliases, otherLangIds } = require('shiki-languages')
const visit = require('unist-util-visit')
const _ = require('lodash')

const CLASS_BLOCK = 'shiki'
const CLASS_INLINE = 'shiki-inline'

const ERROR_MESSAGE = '<code>ERROR Rendering Code Block</code>'

const languages = [
  ...commonLangIds,
  ...commonLangAliases,
  ...otherLangIds
]

function wrapWithDiv(html, lang) {
  return `<div class="gatsby-highlight" data-language="${lang}">${html}</div>`
}

module.exports = (options) => {
  const theme = options?.theme ? options.theme : 'light_plus'
  const semantic = typeof options.semantic !== 'undefined' ? options.semantic : true
  const skipInline = options?.skipInline
  return async tree => {
    const highlighter = await shiki.getHighlighter({
      theme,
      langs: languages
    })

    const visitor = async (node) => {
      node.type = 'html'
      node.children = undefined
      try {
        node.value = await highlight(node, CLASS_BLOCK, highlighter, semantic ? node.lang === 'cpp' : false)
      } catch (e) {
        console.log(e)
      }
      node.value = node.value.replace('<pre class="shiki"', `<pre class="shiki lang-${node.lang}"`)
      node.value = wrapWithDiv(node.value, node.lang)
      node.lang = node.meta = undefined
    }
    const works = []
    visit(tree, 'code', (node) => { works.push(visitor(node)) })
    await Promise.all(works)
    if (!skipInline) {
      visit(tree, 'inlineCode', async node => {
        node.type = 'html'
        try {
          node.value = await highlight(node, CLASS_INLINE, highlighter, false)
        } catch (e) {
          // node.value = ERROR_MESSAGE
          console.log(e)
        }
      })
    }
  }
}

function highlight ({ value, lang }, cls, highlighter, semantic = false) {
  const index = languages.findIndex((x) => x === lang)

  if (index >= 0) {
    return highlighter.codeToHtml(value, lang, semantic)
  }

  // Fallback for unknown languages.
  return `<pre class="${cls}"><code>${_.escape(value)}</code></pre>`
}
