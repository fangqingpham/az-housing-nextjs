'use client'

import { useMemo } from 'react'
import { renderArticleBody } from '@/lib/articles/format'

export default function ArticleBody({ body, emptyMessage = 'Full article coming soon.' }: { body?: string; emptyMessage?: string }) {
  const html = useMemo(() => renderArticleBody(body || ''), [body])

  return (
    <>
      <div
        className="article-content"
        dangerouslySetInnerHTML={{ __html: html || `<p class="article-empty">${emptyMessage}</p>` }}
      />
      <style jsx global>{`
        .article-content { color: var(--mid); font-size: clamp(15px, 2vw, 17px); line-height: 1.8; overflow-wrap: anywhere; }
        .article-content > :first-child { margin-top: 0; }
        .article-content > :last-child { margin-bottom: 0; }
        .article-content p { margin: 0 0 1.25em; }
        .article-content h1, .article-content h2, .article-content h3, .article-content h4 { color: var(--dark); font-family: var(--serif); line-height: 1.25; margin: 1.6em 0 0.65em; }
        .article-content h1 { font-size: clamp(1.8rem, 4vw, 2.4rem); }
        .article-content h2 { font-size: clamp(1.45rem, 3vw, 1.9rem); }
        .article-content h3 { font-size: clamp(1.2rem, 2.5vw, 1.5rem); }
        .article-content ul, .article-content ol { margin: 0 0 1.35em; padding-left: 1.6em; }
        .article-content li { margin: 0.45em 0; padding-left: 0.2em; }
        .article-content strong { color: var(--dark); font-weight: 700; }
        .article-content a { color: #b96f05; text-decoration: underline; text-underline-offset: 2px; }
        .article-content blockquote { margin: 1.5em 0; padding: 0.25em 0 0.25em 1.25em; border-left: 4px solid var(--accent); color: var(--dark); }
        .article-content img { display: block; max-width: 100%; height: auto; margin: 1.5em auto; border-radius: 10px; }
        .article-content hr { border: 0; border-top: 1px solid #e5e0d8; margin: 2em 0; }
        .article-content code { padding: 0.12em 0.35em; border-radius: 4px; background: #f1eee8; font-size: 0.9em; }
        .article-content pre { max-width: 100%; overflow-x: auto; padding: 1em; border-radius: 8px; background: #f1eee8; }
        .article-content pre code { padding: 0; background: transparent; }
        .article-content .article-empty { color: #999; font-style: italic; }
      `}</style>
    </>
  )
}
