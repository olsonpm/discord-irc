import _ from 'lodash'
import ircFormatting from 'irc-formatting'

function isUrl(word) {
  return word.match(/^https?:\/\//)
}

/**
 * returns an array of tokens which are simply either whitespace or
 *   non-whitespace characters
 */
function parseContent(text) {
  const content = [],
    wsOrNotWsRe = /(\s+|[^\s]+)/

  let token = text.match(wsOrNotWsRe)[1]

  while (token) {
    content.push(token)
    text = text.slice(token.length)
    token = _.get(text.match(wsOrNotWsRe), 1)
  }

  return content
}

/**
 * mostly intended to remove gifs, but generally speaking urls aren't useful for
 *   in game chat anyway
 */
function removeUrls(content) {
  const newContent = []

  for (let i = 0; i < content.length; i += 1) {
    const token = content[i]
    if (isUrl(token)) {
      // remove either the previous or next token, which will be whitespace.
      if (i > 0) {
        newContent.pop()
      } else if (content.length > 1) {
        i += 1
      }
      continue
    } else {
      newContent.push(token)
    }
  }

  return newContent
}

function toAscii(token) {
  // eslint-disable-next-line no-control-regex
  return _.deburr(token).replace(/[^\x00-\x7F]/g, '')
}

/**
 * this text filter is not perfect, but it should work well enough for the
 *   purpose of keeping the text between in-game and discord manage'able
 */
export function toPlainText(text) {
  if (!text) return ''

  return removeUrls(parseContent(text)).map(toAscii).join('')
}

export function formatFromIRCToDiscord(text) {
  const blocks = ircFormatting.parse(text).map(block => ({
    // Consider reverse as italic, some IRC clients use that
    ...block,
    italic: block.italic || block.reverse,
  }))
  let mdText = ''

  for (let i = 0; i <= blocks.length; i += 1) {
    // Default to unstyled blocks when index out of range
    const block = blocks[i] || {}
    const prevBlock = blocks[i - 1] || {}

    // Add start markers when style turns from false to true
    if (!prevBlock.italic && block.italic) mdText += '*'
    if (!prevBlock.bold && block.bold) mdText += '**'
    if (!prevBlock.underline && block.underline) mdText += '__'

    // Add end markers when style turns from true to false
    // (and apply in reverse order to maintain nesting)
    if (prevBlock.underline && !block.underline) mdText += '__'
    if (prevBlock.bold && !block.bold) mdText += '**'
    if (prevBlock.italic && !block.italic) mdText += '*'

    mdText += block.text || ''
  }

  return mdText
}
