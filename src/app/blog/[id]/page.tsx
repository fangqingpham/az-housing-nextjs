"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BLOGS } from "@/lib/utils";
import { getArticleById } from "@/lib/api";
import type { BlogPost } from "@/types";

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined); // undefined = loading
  const [allPosts, setAllPosts] = useState<BlogPost[]>(BLOGS);

  useEffect(() => {
    // Try static first for instant render
    const staticPost = BLOGS.find(b => b.id === id);
    if (staticPost) {
      setPost(staticPost);
      return;
    }
    // Otherwise look in Supabase
    getArticleById(id).then(dbPost => {
      setPost(dbPost); // null if not found
    });
  }, [id]);

  const related = allPosts.filter(b => b.id !== id).slice(0, 3);

  if (post === undefined) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--mid)" }}>Loading…</p>
      </main>
    );
  }

  if (!post) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "2rem", color: "var(--dark)", marginBottom: 16 }}>Post Not Found</h2>
          <Link href="/blog" className="btn-primary">Back to Blog</Link>
        </div>
      </main>
    );
  }

  const img = post.image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80";
  const author = post.author || "A-Z Housing Team";
  const readTime = post.readTime || post.read || "5 min read";

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <div style={{ height: 420, background: `linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.6) 100%), url(${img}) center/cover no-repeat`, display: "flex", alignItems: "flex-end", padding: "0 0 48px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px", width: "100%" }}>
          <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.4)", color: "#fff", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontSize: 13, marginBottom: 20 }}>
            Back
          </button>
          {post.cat && (
            <div style={{ display: "inline-block", background: "var(--accent)", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", borderRadius: 20, padding: "3px 12px", marginBottom: 14 }}>
              {post.cat}
            </div>
          )}
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.6rem,4vw,2.6rem)", color: "#fff", lineHeight: 1.3, marginBottom: 16 }}>{post.title}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 20, color: "rgba(255,255,255,0.8)", fontSize: 14, flexWrap: "wrap" }}>
            <span>{author}</span>
            <span>{post.date}</span>
            <span>{readTime}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "clamp(28px,5vw,56px)", boxShadow: "0 2px 20px rgba(0,0,0,0.07)", marginBottom: 48 }}>
          <p style={{ fontSize: "1.15rem", color: "var(--dark)", lineHeight: 1.8, fontStyle: "italic", borderLeft: "4px solid var(--accent)", paddingLeft: 20, marginBottom: 32 }}>{post.excerpt}</p>
          <div
            style={{ color: "var(--mid)", lineHeight: 1.85, fontSize: "1rem" }}
            dangerouslySetInnerHTML={{ __html: post.body || "<p>Full article coming soon.</p>" }}
          />
        </div>

        <div style={{ background: "#fff", borderRadius: 14, padding: "28px 32px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 20, marginBottom: 48, flexWrap: "wrap" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 24, flexShrink: 0 }}>
            {author.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--dark)", marginBottom: 4 }}>{author}</div>
            <div style={{ color: "var(--mid)", fontSize: 14 }}>Real estate analyst and contributing writer at A-Z Housing Solutions.</div>
          </div>
        </div>

        {related.length > 0 && (
          <div>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", color: "var(--dark)", marginBottom: 24 }}>Related Articles</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 20 }}>
              {related.map(rel => (
                <Link key={rel.id} href={`/blog/${rel.id}`} style={{ textDecoration: "none" }}>
                  <article style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
                    <div style={{ height: 140, background: `url(${rel.image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80"}) center/cover no-repeat` }} />
                    <div style={{ padding: 16 }}>
                      <h4 style={{ fontFamily: "var(--serif)", fontSize: "0.95rem", color: "var(--dark)", lineHeight: 1.4, marginBottom: 8 }}>{rel.title}</h4>
                      <div style={{ fontSize: 12, color: "var(--mid)" }}>{rel.readTime || rel.read}</div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Link href="/blog" className="btn-secondary" style={{ textDecoration: "none" }}>All Articles</Link>
        </div>
      </div>
    </main>
  );
}
