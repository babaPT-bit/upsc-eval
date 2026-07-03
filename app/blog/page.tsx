import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import blogData from "../../content/blog.json";

export const metadata = {
  title: "Blog — Abhyaas AI",
  description: "Strategy, answer writing, and UPSC Mains insights from Abhyaas AI.",
};

export default function BlogPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
      <Nav />
      <div className="site-wrap" style={{ paddingTop: 64, paddingBottom: 96 }}>
        <span className="eyebrow">The blog</span>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-3xl)", letterSpacing: "-0.02em", marginBottom: 8 }}>
          Strategy & insights
        </h1>
        <p style={{ color: "var(--ink-muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 56, maxWidth: 520 }}>
          Answer writing, examiner patterns, scoring breakdowns. Written for aspirants who want to understand the game, not just play it.
        </p>

        <div>
          {blogData.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 32, padding: "32px 0", borderBottom: i < blogData.length - 1 ? "1px solid var(--hairline)" : "none", textDecoration: "none" }}
              className="post-row"
            >
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)", marginBottom: 6 }}>{post.dateFormatted}</div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent)" }}>{post.tag}</span>
              </div>
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 20, color: "var(--ink)", lineHeight: 1.35, marginBottom: 10 }}>{post.title}</h2>
                <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.7 }}>{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
