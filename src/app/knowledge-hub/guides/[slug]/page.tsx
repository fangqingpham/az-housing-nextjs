import { cache } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import GuideDetailClient from './GuideDetailClient'

const SITE_URL = 'https://www.azhouse.ca'

const getGuideData = cache(async (slug: string) => {
  const supabase = createClient()
  const { data } = await supabase
    .from('articles')
    .select('title, excerpt, image, cat, date, author')
    .eq('id', slug)
    .single()
  return data
})

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getGuideData(params.slug)
  if (!data) return { title: 'Guide Not Found' }

  const desc = (data.excerpt || `${data.cat || 'Real estate'} guide from A-Z Housing Solutions.`).slice(0, 160)

  return {
    title: data.title,
    description: desc,
    alternates: { canonical: `${SITE_URL}/knowledge-hub/guides/${params.slug}` },
    openGraph: {
      title: data.title,
      description: desc,
      url: `${SITE_URL}/knowledge-hub/guides/${params.slug}`,
      type: 'article',
      images: data.image
        ? [{ url: data.image, width: 1200, height: 630, alt: data.title }]
        : [{ url: '/og-image.jpg', width: 1200, height: 630, alt: data.title }],
    },
  }
}

export default async function GuideDetailPage({ params }: { params: { slug: string } }) {
  const data = await getGuideData(params.slug)

  const jsonLd = data
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.title,
        description: data.excerpt || '',
        datePublished: data.date || '',
        articleSection: data.cat || 'Real Estate',
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
          '@id': `${SITE_URL}/knowledge-hub/guides/${params.slug}`,
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
      <GuideDetailClient />
    </>
  )
}
