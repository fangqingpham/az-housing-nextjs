import { heroSources } from './content'

export default function Head() {
  return (
    <>
      <link
        rel="preload"
        as="image"
        media="(max-width: 759px)"
        href={heroSources.mobileFallback.src}
        imageSrcSet={heroSources.mobileSrcSet}
        imageSizes="100vw"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        media="(min-width: 760px)"
        href={heroSources.fallback.src}
        imageSrcSet={heroSources.srcSet}
        imageSizes="(max-width: 1160px) 42vw, 470px"
        fetchPriority="high"
      />
    </>
  )
}
