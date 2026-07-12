import type { Metadata } from 'next'
import Image from 'next/image'
import { Be_Vietnam_Pro } from 'next/font/google'
import BridgeInteractions from './BridgeInteractions'
import { clientServices, heroSources, services, trustPoints } from './content'
import styles from './page.module.css'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese'],
  weight: ['400', '500', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Đến Canada không lo chỗ ở',
  description:
    'A-Z Housing hỗ trợ du học sinh, phụ huynh và người mới đến Canada tìm hiểu dịch vụ chỗ ở, xem nhà từ xa, đón sân bay, dịch vụ giám hộ cho học sinh dưới 18 tuổi và chi phí.',
  alternates: {
    canonical: 'https://www.azhouse.ca/vi/ho-tro-den-canada',
  },
  openGraph: {
    title: 'Đến Canada không lo chỗ ở - A-Z Housing',
    description:
      'Trang hỗ trợ tiếng Việt cho du học sinh, phụ huynh và người mới đến Canada.',
    url: 'https://www.azhouse.ca/vi/ho-tro-den-canada',
    locale: 'vi_VN',
    type: 'website',
    images: ['/og-image.jpg'],
  },
}

export default function VietnamBridgePage() {
  return (
    <main className={`${beVietnamPro.className} ${styles.page}`} lang="vi">
      <section className={styles.hero}>
        <div className={styles.topbar}>
          <Image
            src="/images/az-housing-logo-blue.png"
            alt="A-Z Housing Solutions"
            width={50}
            height={50}
            priority
            className={styles.logo}
          />
          <div className={styles.topActions} aria-label="Liên kết nhanh">
            <a className={styles.textButton} href="https://azhouse.ca" target="_blank" rel="noopener noreferrer" data-az-action="bridge-top-home" data-location="top_header">
              Trang chủ
            </a>
            <a className={styles.textButton} href="https://azhouse.ca/landing-arrangement" target="_blank" rel="noopener noreferrer" data-az-action="bridge-top-service" data-location="top_header">
              Dịch vụ
            </a>
            <a className={`${styles.textButton} ${styles.messengerButton}`} href="https://m.me/azhousesolution" target="_blank" rel="noopener noreferrer" data-az-action="messenger" data-location="top_header">
              Messenger
            </a>
          </div>
        </div>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.label}>Đồng hành cùng bạn từ ngày đầu tại Canada</p>
            <h1>
              <span>Đến Canada</span>
              <span>Không lo chỗ ở - Đã có A-Z!</span>
            </h1>
            <p className={styles.description}>
              A-Z Housing hỗ trợ du học sinh, phụ huynh và người mới đến Canada tìm hiểu các dịch vụ phù hợp trước và sau ngày đến.
            </p>
            <div className={styles.trustList} aria-label="Điểm tin cậy">
              {trustPoints.map(point => <span key={point}>{point}</span>)}
            </div>
            <div className={styles.heroActions}>
              <button className={styles.primaryButton} data-az-action="chat" data-location="hero_primary">
                Chat ngay với A-Z
              </button>
              <a className={styles.secondaryButton} href="https://m.me/azhousesolution" target="_blank" rel="noopener noreferrer" data-az-action="messenger" data-location="hero_secondary">
                Nhắn tin qua Messenger
              </a>
            </div>
          </div>
          <div className={styles.heroImageWrap}>
            <picture>
              <source
                media="(max-width: 759px)"
                srcSet={heroSources.mobileSrcSet}
                sizes="100vw"
              />
              <img
                src={heroSources.fallback.src}
                srcSet={heroSources.srcSet}
                alt="Người mới đến Canada trong khung cảnh thành phố sáng sủa"
                width={heroSources.fallback.width}
                height={heroSources.fallback.height}
                fetchPriority="high"
                decoding="async"
                sizes="(max-width: 1160px) 42vw, 470px"
                className={styles.heroImage}
              />
            </picture>
            <div className={styles.arrivalCard}>
              <strong>Hỗ trợ tiếng Việt</strong>
              <span>Trước và sau ngày đến Canada</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.services} aria-labelledby="services-title">
        <div className={styles.sectionHeader}>
          <p className={styles.label}>Dịch vụ</p>
          <h2 id="services-title">A-Z Housing có thể hỗ trợ gì cho bạn?</h2>
        </div>

        <div className={styles.cardGrid}>
          {services.map((service, index) => (
            <article className={styles.serviceCard} key={service.id} id={service.id}>
              <div className={styles.cardImage}>
                <Image
                  src={service.image}
                  alt={service.imageAlt}
                  fill
                  sizes="(max-width: 759px) 100vw, (max-width: 1079px) 50vw, 360px"
                  loading={index < 2 ? 'eager' : 'lazy'}
                  placeholder="blur"
                  className={styles.serviceImage}
                />
              </div>
              <div className={styles.cardBody}>
                <details className={styles.cardDetails} data-service-id={service.id}>
                  <summary className={styles.cardToggle}>
                    <span>
                      <strong>{service.title}</strong>
                      <small>{service.summary}</small>
                    </span>
                    <span aria-hidden="true" className={styles.toggleIcon}></span>
                  </summary>
                  <div className={styles.expanded}>
                    <p>{service.explanation}</p>
                    <dl>
                      <div>
                        <dt>Phù hợp với</dt>
                        <dd>{service.audience}</dd>
                      </div>
                      <div>
                        <dt>Lợi ích chính</dt>
                        <dd>{service.benefits.join(' · ')}</dd>
                      </div>
                      <div>
                        <dt>Chi phí</dt>
                        <dd>{service.price}</dd>
                      </div>
                    </dl>
                    <a
                      className={styles.readMoreButton}
                      href="/landing-arrangement"
                      data-az-action="landing-arrangement-read-more"
                      data-service-id={service.id}
                    >
                      Đọc thêm
                    </a>
                  </div>
                </details>
                <button className={styles.cardButton} data-az-action="service-question" data-service-id={service.id}>
                  Hỏi thêm
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.bottomCta}>
        <div>
          <p className={styles.label}>Liên hệ nhanh</p>
          <h2>Bạn cần hỗ trợ ngay?</h2>
          <p>Chat trực tiếp với A-Z để được tư vấn hoặc để lại thông tin, chúng tôi sẽ liên hệ lại.</p>
        </div>
        <div className={styles.bottomActions}>
          <button className={styles.primaryButton} data-az-action="chat" data-location="bottom_cta">
            Chat ngay với A-Z
          </button>
          <button className={styles.secondaryButton} data-az-action="lead">
            Để lại thông tin
          </button>
        </div>
      </section>

      <BridgeInteractions services={clientServices} />
    </main>
  )
}
