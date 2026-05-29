'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getArticles } from '@/lib/api';
import { useLanguage } from '@/hooks/useLanguage';
import type { BlogPost } from '@/types';

const STATIC_CATEGORIES_EN = [
  {
    icon: '🏷️',
    color: 'var(--accent)',
    title: 'Buying & Selling',
    guides: [
      { id: 'art-1778185559744-ovt5x8',  title: "First-Time Buyer's Complete Guide",  read: '12 min read', excerpt: 'Everything from pre-approval to closing day.' },
      { id: 'art-1778185559745-w7xlna',  title: 'How to Price Your Home to Sell',     read: '8 min read',  excerpt: 'Data-driven pricing strategies for the Canadian market.' },
      { id: 'art-1778185559746-pw67h7',  title: 'Understanding Closing Costs',        read: '6 min read',  excerpt: 'Land transfer tax, legal fees, and what to budget.' },
      { id: 'art-1778185559747-6ys59p',  title: "Buying in a Seller's Market",        read: '7 min read',  excerpt: 'Offer strategies, escalation clauses & deposit advice.' },
    ],
  },
  {
    icon: '💰',
    color: '#4a90d9',
    title: 'Mortgages & Finance',
    guides: [
      { id: 'fixed-vs-variable',       title: 'Fixed vs Variable Rate: Which Is Right for You?', read: '9 min read',  excerpt: 'Breaking down the trade-offs in plain language.' },
      { id: 'mortgage-stress-test',    title: 'How the Mortgage Stress Test Works',              read: '5 min read',  excerpt: 'Qualifying rates, calculations & what to expect.' },
      { id: 'fhsa-rrsp-fhbtc',         title: "FHSA, RRSP Home Buyers' Plan & FHBTC",           read: '10 min read', excerpt: 'Maximise federal programs to boost your down payment.' },
      { id: 'renewing-vs-refinancing', title: 'Renewing vs Refinancing Your Mortgage',           read: '7 min read',  excerpt: 'When to switch lenders and how to negotiate.' },
    ],
  },
  {
    icon: '🏘️',
    color: '#27ae60',
    title: 'Renting',
    guides: [
      { id: 'art-1778185559748-g15mze', title: 'Tenant Rights in Canada: Province-by-Province', read: '11 min read', excerpt: 'Know your protections before you sign a lease.' },
      { id: 'art-1778185559749-qdzuck', title: 'How to Negotiate Your Rent',                    read: '5 min read',  excerpt: 'Practical tactics for new and renewing tenants.' },
      { id: 'art-1778185559751-e8x80u', title: 'What to Look for in a Lease Agreement',         read: '8 min read',  excerpt: 'Red flags, must-have clauses & common traps.' },
      { id: 'art-1778185559752-hzzsfj', title: 'Renting as a New Canadian Immigrant',           read: '9 min read',  excerpt: 'Building credit history and securing your first rental.' },
    ],
  },
  {
    icon: '🔨',
    color: '#e67e22',
    title: 'Renovation & Maintenance',
    guides: [
      { id: 'art-1778185559753-rzy66u', title: 'Top 5 Renovations That Add Real Value',     read: '7 min read',  excerpt: 'Kitchen, bathrooms, and curb appeal ranked by ROI.' },
      { id: 'art-1778185559754-hpd8tu', title: 'Seasonal Home Maintenance Checklist',       read: '6 min read',  excerpt: 'What to do every spring, summer, fall, and winter.' },
      { id: 'art-1778185559755-1mrklr', title: 'How to Budget a Major Renovation',         read: '8 min read',  excerpt: 'Cost estimates, contingency planning & contractor tips.' },
      { id: 'art-1778185559756-m7p47d', title: 'DIY vs Hiring a Contractor',               read: '5 min read',  excerpt: 'When to roll up your sleeves and when to call a pro.' },
    ],
  },
  {
    icon: '⚖️',
    color: '#8e44ad',
    title: 'Legal Resources',
    guides: [
      { id: 'bc-alberta-tenancy-changes', title: 'Recent Tenancy Law Changes in BC & Alberta', read: '8 min read',  excerpt: 'What landlords and tenants need to know in 2024.' },
      { id: 'foreign-buyer-ban',          title: "Canada's Foreign Buyer Ban Explained",       read: '6 min read',  excerpt: 'Who is affected, exemptions, and what comes next.' },
      { id: 'art-1778185559757-nxu481',   title: "Ontario's Condo Act: Owner Rights",         read: '7 min read',  excerpt: 'Disputes, maintenance fees, and board governance.' },
      { id: 'art-1778185559759-4od8yk',   title: 'Anti-Flipping Tax Rule (Bill C-268)',        read: '5 min read',  excerpt: 'How the 12-month ownership rule affects your sale.' },
    ],
  },
];

const STATIC_CATEGORIES_ZH = [
  {
    icon: '🏷️',
    color: 'var(--accent)',
    title: '购房与出售',
    guides: [
      { id: 'art-1778185559744-ovt5x8',  title: '首次购房者完整指南',              read: '12 分钟', excerpt: '从预批到完成过户的全流程指导。' },
      { id: 'art-1778185559745-w7xlna',  title: '如何定价让房屋快速出售',          read: '8 分钟',  excerpt: '基于数据的加拿大市场定价策略。' },
      { id: 'art-1778185559746-pw67h7',  title: '了解过户费用',                    read: '6 分钟',  excerpt: '土地转让税、律师费及预算建议。' },
      { id: 'art-1778185559747-6ys59p',  title: '在卖方市场中购房',                read: '7 分钟',  excerpt: '出价策略、加价条款与定金建议。' },
    ],
  },
  {
    icon: '💰',
    color: '#4a90d9',
    title: '房贷与财务',
    guides: [
      { id: 'fixed-vs-variable',       title: '固定利率 vs 浮动利率：哪个更适合你？', read: '9 分钟',  excerpt: '用通俗语言解析两种利率的优缺点。' },
      { id: 'mortgage-stress-test',    title: '房贷压力测试如何运作',                read: '5 分钟',  excerpt: '资格利率、计算方式及注意事项。' },
      { id: 'fhsa-rrsp-fhbtc',         title: 'FHSA、RRSP首次购房计划与FHBTC',     read: '10 分钟', excerpt: '最大化利用联邦项目提升首付款。' },
      { id: 'renewing-vs-refinancing', title: '续签 vs 再融资贷款',                 read: '7 分钟',  excerpt: '何时换贷款机构及如何谈判。' },
    ],
  },
  {
    icon: '🏘️',
    color: '#27ae60',
    title: '租房',
    guides: [
      { id: 'art-1778185559748-g15mze', title: '加拿大租户权利：各省详解',         read: '11 分钟', excerpt: '签租约前了解您的权利保障。' },
      { id: 'art-1778185559749-qdzuck', title: '如何谈判租金',                      read: '5 分钟',  excerpt: '新租户和续租者的实用技巧。' },
      { id: 'art-1778185559751-e8x80u', title: '租约协议中的注意事项',              read: '8 分钟',  excerpt: '红旗条款、必备条款与常见陷阱。' },
      { id: 'art-1778185559752-hzzsfj', title: '新移民在加拿大租房',                read: '9 分钟',  excerpt: '建立信用记录并获得第一套租房。' },
    ],
  },
  {
    icon: '🔨',
    color: '#e67e22',
    title: '装修与维护',
    guides: [
      { id: 'art-1778185559753-rzy66u', title: '提升房产价值的5大改造项目',        read: '7 分钟',  excerpt: '厨房、浴室和外观改造按回报率排名。' },
      { id: 'art-1778185559754-hpd8tu', title: '季节性房屋维护清单',               read: '6 分钟',  excerpt: '春夏秋冬各季度该做什么。' },
      { id: 'art-1778185559755-1mrklr', title: '如何为大型装修做预算',             read: '8 分钟',  excerpt: '成本估算、应急计划与承包商建议。' },
      { id: 'art-1778185559756-m7p47d', title: 'DIY还是聘请承包商',                read: '5 分钟',  excerpt: '何时自己动手，何时找专业人士。' },
    ],
  },
  {
    icon: '⚖️',
    color: '#8e44ad',
    title: '法律资源',
    guides: [
      { id: 'bc-alberta-tenancy-changes', title: 'BC省和阿尔伯塔省最新租约法变化', read: '8 分钟',  excerpt: '2024年房东和租户需了解的内容。' },
      { id: 'foreign-buyer-ban',          title: '加拿大外国买家禁令解析',         read: '6 分钟',  excerpt: '受影响群体、豁免条件及未来展望。' },
      { id: 'art-1778185559757-nxu481',   title: '安大略省公寓法：业主权利',       read: '7 分钟',  excerpt: '纠纷处理、管理费及董事会治理。' },
      { id: 'art-1778185559759-4od8yk',   title: '反炒房税规则（C-268法案）',      read: '5 分钟',  excerpt: '12个月持有规则如何影响您的出售。' },
    ],
  },
];

const CAT_META: Record<string, { color: string; icon: string }> = {
  'Buying & Selling':         { color: 'var(--accent)', icon: '🏷️' },
  'Mortgages & Finance':      { color: '#4a90d9',       icon: '💰' },
  'Renting':                  { color: '#27ae60',       icon: '🏘️' },
  'Renovation & Maintenance': { color: '#e67e22',       icon: '🔨' },
  'Legal Resources':          { color: '#8e44ad',       icon: '⚖️' },
};

export default function GuidesPage() {
  const { t, lang } = useLanguage();
  const g = t.guides;
  const [dbArticles, setDbArticles] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArticles().then(articles => {
      setDbArticles(articles);
      setLoading(false);
    });
  }, []);

  const grouped: Record<string, BlogPost[]> = {};
  for (const a of dbArticles) {
    if (!grouped[a.cat]) grouped[a.cat] = [];
    grouped[a.cat].push(a);
  }

  const STATIC_CATEGORIES = lang === 'zh' ? STATIC_CATEGORIES_ZH : STATIC_CATEGORIES_EN;

  const categories = STATIC_CATEGORIES.map((cat, idx) => {
    const enTitle = STATIC_CATEGORIES_EN[idx].title;
    const live = grouped[enTitle] || [];
    return { ...cat, liveGuides: live, staticGuides: cat.guides };
  });

  const extraCats = Object.keys(grouped).filter(
    k => !STATIC_CATEGORIES_EN.find(c => c.title === k)
  );

  const statsBar = [
    { n: loading ? '…' : String(dbArticles.length || '20+'), l: lang === 'zh' ? '专业指南' : 'Expert Guides' },
    { n: '5',      l: lang === 'zh' ? '分类' : 'Categories' },
    { n: lang === 'zh' ? '免费' : 'Free',   l: lang === 'zh' ? '始终免费' : 'Always Free' },
    { n: lang === 'zh' ? '每周' : 'Weekly', l: lang === 'zh' ? '新内容' : 'New Content' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: 'var(--cream)' }}>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, var(--dark) 0%, #2c3e50 100%)', padding: 'clamp(60px,8vw,100px) 24px', textAlign: 'center', color: '#fff' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem,5vw,3rem)', marginBottom: 16, fontWeight: 700 }}>
            {lang === 'zh' ? '知识中心 — 指南' : 'Knowledge Hub — Guides'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(1rem,2vw,1.15rem)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 28px' }}>
            {lang === 'zh'
              ? '购房、出售、租房、房贷、装修及加拿大房地产法律的专业指南 — 一站式获取。'
              : 'Expert guides on buying, selling, renting, mortgages, renovation, and Canadian real estate law — all in one place.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {STATIC_CATEGORIES.map(c => (
              <a key={c.title} href={`#${c.title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')}`}
                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)', textDecoration: 'none', borderRadius: 999, padding: '8px 18px', fontSize: 13, fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>
                {c.icon} {c.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eee' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '18px 24px', display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          {statsBar.map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: 'var(--accent)', fontWeight: 700 }}>{s.n}</div>
              <div style={{ fontSize: 12, color: 'var(--mid)', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Guide categories */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(40px,6vw,70px) 24px' }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--mid)', fontSize: 15 }}>
            {lang === 'zh' ? '正在加载指南…' : 'Loading guides…'}
          </div>
        )}

        {categories.map((cat, catIdx) => {
          const guides = cat.liveGuides.length > 0 ? cat.liveGuides : cat.staticGuides;
          const anchorId = cat.title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-');
          return (
            <section key={cat.title} id={anchorId} style={{ marginBottom: 64, scrollMarginTop: 80 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                <span style={{ fontSize: 32 }}>{cat.icon}</span>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem,3vw,1.9rem)', color: 'var(--dark)', margin: 0 }}>{cat.title}</h2>
                {cat.liveGuides.length > 0 && (
                  <span style={{ background: cat.color + '18', color: cat.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                    {cat.liveGuides.length} {lang === 'zh' ? '篇' : (cat.liveGuides.length !== 1 ? 'articles' : 'article')}
                  </span>
                )}
              </div>
              <div style={{ height: 3, background: `linear-gradient(to right, ${cat.color}, transparent)`, borderRadius: 4, marginBottom: 28 }} />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                {(guides as (BlogPost | typeof cat.staticGuides[0])[]).map((g2, i) => {
                  const isLive = 'excerpt' in g2 && 'id' in g2;
                  const href = `/knowledge-hub/guides/${g2.id}`;
                  const title = g2.title;
                  const desc = isLive ? (g2 as BlogPost).excerpt : (g2 as typeof cat.staticGuides[0]).excerpt;
                  const readTime = isLive ? ((g2 as BlogPost).read || (g2 as BlogPost).readTime || '5 min read') : (g2 as typeof cat.staticGuides[0]).read;

                  const cardInner = (
                    <article style={{ background: '#fff', borderRadius: 14, padding: '24px 22px', border: `2px solid ${cat.color}22`, transition: 'transform .18s, box-shadow .18s, border-color .18s', cursor: isLive ? 'pointer' : 'default', height: '100%', display: 'flex', flexDirection: 'column', opacity: isLive ? 1 : 0.72 }}
                      onMouseEnter={e => { if (!isLive) return; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.10)'; (e.currentTarget as HTMLElement).style.borderColor = cat.color; }}
                      onMouseLeave={e => { if (!isLive) return; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.borderColor = cat.color + '22'; }}
                    >
                      {isLive && (g2 as BlogPost).image && (
                        <div style={{ height: 140, borderRadius: 8, overflow: 'hidden', marginBottom: 16, flexShrink: 0 }}>
                          <img src={(g2 as BlogPost).image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--dark)', marginBottom: 10, lineHeight: 1.45, flex: 1 }}>{title}</h3>
                      <p style={{ color: 'var(--mid)', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{desc}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: 'var(--mid)' }}>⏱ {readTime}</span>
                        {isLive
                          ? <span style={{ fontSize: 13, color: cat.color, fontWeight: 700 }}>{lang === 'zh' ? '阅读 →' : 'Read →'}</span>
                          : <span style={{ fontSize: 11, color: 'var(--mid)', fontStyle: 'italic' }}>{lang === 'zh' ? '即将推出' : 'Coming soon'}</span>
                        }
                      </div>
                    </article>
                  );

                  return isLive
                    ? <Link key={g2.id || i} href={href} style={{ textDecoration: 'none', display: 'block' }}>{cardInner}</Link>
                    : <div key={String(i)}>{cardInner}</div>;
                })}
              </div>
            </section>
          );
        })}

        {!loading && extraCats.map(catName => {
          const meta = CAT_META[catName] || { color: 'var(--accent)', icon: '📄' };
          const articles = grouped[catName];
          const anchorId = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return (
            <section key={catName} id={anchorId} style={{ marginBottom: 64, scrollMarginTop: 80 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                <span style={{ fontSize: 32 }}>{meta.icon}</span>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem,3vw,1.9rem)', color: 'var(--dark)', margin: 0 }}>{catName}</h2>
                <span style={{ background: meta.color + '18', color: meta.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, marginLeft: 'auto' }}>
                  {articles.length} {lang === 'zh' ? '篇' : (articles.length !== 1 ? 'articles' : 'article')}
                </span>
              </div>
              <div style={{ height: 3, background: `linear-gradient(to right, ${meta.color}, transparent)`, borderRadius: 4, marginBottom: 28 }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                {articles.map(a => (
                  <Link key={a.id} href={`/blog/${a.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <article style={{ background: '#fff', borderRadius: 14, padding: '24px 22px', border: `2px solid ${meta.color}22`, transition: 'transform .18s, box-shadow .18s, border-color .18s', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.10)'; (e.currentTarget as HTMLElement).style.borderColor = meta.color; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.borderColor = meta.color + '22'; }}
                    >
                      {a.image && <div style={{ height: 140, borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}><img src={a.image} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                      <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--dark)', marginBottom: 10, lineHeight: 1.45, flex: 1 }}>{a.title}</h3>
                      <p style={{ color: 'var(--mid)', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{a.excerpt}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: 'var(--mid)' }}>⏱ {a.read || a.readTime || '5 min read'}</span>
                        <span style={{ fontSize: 13, color: meta.color, fontWeight: 700 }}>{lang === 'zh' ? '阅读 →' : 'Read →'}</span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Blog CTA */}
      <section style={{ background: '#fff', padding: 'clamp(48px,6vw,72px) 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 36, alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', color: 'var(--dark)', marginBottom: 12 }}>
              {lang === 'zh' ? '想了解最新资讯？' : 'Looking for the latest news?'}
            </h3>
            <p style={{ color: 'var(--mid)', lineHeight: 1.7, marginBottom: 24 }}>
              {lang === 'zh'
                ? '访问我们的博客，获取每周市场评论、政策更新及加拿大房地产专业人士的建议。'
                : 'Visit our blog for weekly market commentary, policy updates, and advice from Canadian real estate professionals.'}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/blog" style={{ background: 'var(--dark)', color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 700, fontSize: 14 }}>
                {lang === 'zh' ? '阅读博客' : 'Read the Blog'}
              </Link>
              <Link href="/contact" style={{ background: 'var(--cream)', color: 'var(--dark)', textDecoration: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 600, fontSize: 14, border: '1px solid rgba(0,0,0,0.1)' }}>
                {lang === 'zh' ? '咨询专家' : 'Ask an Expert'}
              </Link>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {statsBar.map(s => (
              <div key={s.l} style={{ background: 'var(--cream)', borderRadius: 12, padding: '18px 16px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '1.7rem', color: 'var(--accent)', fontWeight: 700 }}>{s.n}</div>
                <div style={{ fontSize: 12, color: 'var(--mid)', marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
