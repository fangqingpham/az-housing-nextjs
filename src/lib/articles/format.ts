import { marked } from 'marked'
import DOMPurify from 'dompurify'

const HTML_PATTERN = /<\/?(?:p|h[1-6]|ul|ol|li|strong|b|em|i|a|blockquote|br|hr|img|pre|code|div|span|table|thead|tbody|tr|th|td)\b[^>]*>/i

export function isLegacyHtml(value: string) {
  return HTML_PATTERN.test(value)
}

export function cleanArticleDraft(value: string) {
  const normalized = value.replace(/\r\n?/g, '\n').replace(/[ \t]+$/gm, '').trim()
  if (isLegacyHtml(normalized)) return normalized

  return normalized
    .replace(/^\s*[•·]\s+/gm, '- ')
    .replace(/\n{3,}/g, '\n\n')
}

export function renderArticleBody(value: string) {
  const source = value?.trim()
  if (!source) return ''

  const html = isLegacyHtml(source)
    ? source
    : marked.parse(source, { async: false, gfm: true, breaks: false })

  return DOMPurify.sanitize(String(html), {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick'],
  })
}
