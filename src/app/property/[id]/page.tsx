import { cache } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import PropertyDetailClient from './PropertyDetailClient'

const SITE_URL = 'https://www.azhouse.ca'

const getListingData = cache(async (id: string) => {
  const supabase = createClient()
  const { data } = await supabase
    .from('listings')
    .select('title, description, city, province, price, price_type, images, bedrooms, bathrooms, address')
    .eq('id', id)
    .single()
  return data
})

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = await getListingData(params.id)
  if (!data) return { title: 'Property Not Found' }

  const listingType = data.price_type === 'rent' ? 'For Rent' : 'For Sale'
  const location = [data.city, data.province].filter(Boolean).join(', ')
  const specs = [
    data.bedrooms ? `${data.bedrooms} bed` : '',
    data.bathrooms ? `${data.bathrooms} bath` : '',
  ].filter(Boolean).join(', ')
  const desc = [
    `${listingType} property${location ? ' in ' + location : ''}`,
    specs,
    data.description?.slice(0, 100),
  ].filter(Boolean).join(' · ').slice(0, 160)

  const imgs = Array.isArray(data.images) ? (data.images as string[]).filter(Boolean) : []

  return {
    title: data.title,
    description: desc,
    alternates: { canonical: `${SITE_URL}/property/${params.id}` },
    openGraph: {
      title: data.title,
      description: desc,
      url: `${SITE_URL}/property/${params.id}`,
      images: imgs[0]
        ? [{ url: imgs[0], width: 1200, height: 630, alt: data.title }]
        : [{ url: '/og-image.jpg', width: 1200, height: 630, alt: data.title }],
    },
  }
}

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const data = await getListingData(params.id)

  const jsonLd = data
    ? {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: data.title,
        url: `${SITE_URL}/property/${params.id}`,
        description: data.description || '',
        numberOfBedrooms: data.bedrooms,
        numberOfBathroomsTotal: data.bathrooms,
        address: {
          '@type': 'PostalAddress',
          streetAddress: data.address || '',
          addressLocality: data.city || '',
          addressRegion: data.province || '',
          addressCountry: 'CA',
        },
        ...(data.price && {
          offers: {
            '@type': 'Offer',
            price: String(data.price).replace(/[^0-9.]/g, ''),
            priceCurrency: 'CAD',
            availability: 'https://schema.org/InStock',
          },
        }),
        ...(Array.isArray(data.images) && data.images[0] && { image: data.images[0] }),
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
      <PropertyDetailClient />
    </>
  )
}
