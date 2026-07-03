import { notFound } from "next/navigation";
import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import blogData from "../../../content/blog.json";

export function generateStaticParams() {
  return blogData.map(post => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = blogData.find(p => p.slug === params.slug);
  if (!post) return {};
  return {
    title: `${post.title} — Abhyaas AI`,
    description: post.excerpt,
  };
}

type ContentBlock = { type: "paragraph" | "heading"; text: string };

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogData.find(p => p.slug === params.slug);
  if (!post) notFound();

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
      <Nav />
      <div className="site-wrap" style={{ paddingTop: 64, paddingBottom: 96, maxWidth: 640 }}>
        <Link href="/blog" style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-muted)", textDecoration: "none", display: "inline-block", marginBottom: 40 }}>← All posts</Link>

        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent)", display: "block", marginBottom: 16 }}>{post.tag}</span>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-3xl)", letterSpacing: "-0.02em", color: "var(--ink)", lineHeight: 1.15, marginBottom: 16 }}>{post.title}</h1>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)", marginBottom: 48 }}>{post.dateFormatted}</div>

        <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 40 }}>
          {(post.content as ContentBlock[]).map((block, i) => {
            if (block.type === "heading") {
              return (
                <h2 key={i} style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, color: "var(--ink)", marginTop: 40, marginBottom: 12, lineHeight: 1.3 }}>{block.text}</h2>
              );
            }
            return (
              <p key={i} style={{ fontSize: 15, color: "var(--ink-muted)", lineHeight: 1.8, marginBottom: 20 }}>{block.text}</p>
            );
          })}
        </div>

        <div style={{ marginTop: 56, paddingTop: 40, borderTop: "1px solid var(--hairline)" }}>
          <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 16 }}>Want to see how your answers score?</p>
          <Link href="/evaluate" style={{ display: "inline-block", padding: "10px 20px", borderRadius: 4, background: "var(--accent)", color: "var(--accent-ink)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
            Evaluate an answer →
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
