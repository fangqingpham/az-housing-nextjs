import { cache } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import BlogPostClient from './BlogPostClient'

const SITE_URL = 'https://www.azhouse.ca'

const getArticleData = cache(async (id: string) => {
  const supabase = createClient()
  const { data } = await supabase
    .from('articles')
    .select('title, excerpt, image, cat, date, author')
    .eq('id', id)
    .single()
  return data
})

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = await getArticleData(params.id)
  if (!data) return { title: 'Article Not Found' }

  const desc = (data.excerpt || '').slice(0, 160)

  return {
    title: data.title,
    description: desc,
    alternates: { canonical: `${SITE_URL}/blog/${params.id}` },
    openGraph: {
      title: data.title,
      description: desc,
      url: `${SITE_URL}/blog/${params.id}`,
      type: 'article',
      images: data.image
        ? [{ url: data.image, width: 1200, height: 630, alt: data.title }]
        : [{ url: '/og-image.jpg', width: 1200, height: 630, alt: data.title }],
    },
  }
}

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const data = await getArticleData(params.id)

  const jsonLd = data
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.title,
        description: data.excerpt || '',
        datePublished: data.date || '',
        author: {
          '@type': 'Person',
          name: data.author || 'A-Z Housing Team',
        },
        publisher: {
          '@type': 'Organization',
          name: 'A-Z Housing Solutions',
          url: SITE_URL,
        },
        ...(data.image && { image: data.image }),
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${SITE_URL}/blog/${params.id}`,
        },
      }
    : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BlogPostClient />
    </>
  )
}
