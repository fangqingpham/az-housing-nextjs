import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const SITE_URL = 'https://www.azhouse.ca'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/buy`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/rent`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/tenant-placement`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/referral-program`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/post-listing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/services/landlords`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/services/buyers-sellers`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/services/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/knowledge-hub/guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  const supabase = createClient()

  // Dynamic property listings
  const { data: listings } = await supabase
    .from('listings')
    .select('id, created_at, updated_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const listingPages: MetadataRoute.Sitemap = (listings || []).map(l => ({
    url: `${SITE_URL}/property/${l.id}`,
    lastModified: new Date(l.updated_at || l.created_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Dynamic blog posts and guides
  const { data: articles } = await supabase
    .from('articles')
    .select('id, created_at')
    .order('created_at', { ascending: false })

  const articlePages: MetadataRoute.Sitemap = (articles || []).map(a => ([
    {
      url: `${SITE_URL}/blog/${a.id}`,
      lastModified: new Date(a.created_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/knowledge-hub/guides/${a.id}`,
      lastModified: new Date(a.created_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ])).flat()

  return [...staticPages, ...listingPages, ...articlePages]
}
