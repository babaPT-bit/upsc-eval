import Link from "next/link";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

/* ─── Product mock — hero right column ───────────────────────────── */
function ScoreMock() {
  const dims = [
    { name: "Content Coverage", score: 8, max: 10 },
    { name: "Language & Clarity", score: 6, max: 8 },
    { name: "Answer Structure", score: 7, max: 10 },
  ];
  return (
    <div style={{ border: "1px solid var(--hairline)", borderRadius: 6, background: "var(--surface)", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--hairline)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>GS2 — Indian Polity</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)" }}>287 words</span>
      </div>
      <div style={{ padding: "24px 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 20 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 700, lineHeight: 1, color: "var(--warning)" }}>73%</span>
          <div style={{ paddingBottom: 6 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--ink-muted)" }}>14.5</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-faint)" }}> / 20</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {dims.map(d => (
            <div key={d.name}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>{d.name}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)" }}>{d.score}/{d.max}</span>
              </div>
              <div style={{ height: 3, background: "var(--hairline)", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${(d.score / d.max) * 100}%`, background: "var(--warning)", borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderLeft: "3px solid var(--hairline)", paddingLeft: 12 }}>
          <p style={{ fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.6, fontStyle: "italic" }}>
            &ldquo;Reasonable understanding of the topic but lacks depth in constitutional analysis. Article 155 cited incorrectly — Governor is appointed by President under Article 155, not on PM's advice as stated.&rdquo;
          </p>
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 6 }}>
          {["Missing Article citations", "Weak conclusion", "No current affairs"].map(t => (
            <span key={t} style={{ fontSize: 10, padding: "2px 8px", border: "1px solid var(--hairline)", borderRadius: 2, color: "var(--ink-faint)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Stats strip ─────────────────────────────────────────────────── */
const STATS = [
  { num: "7", label: "scoring dimensions" },
  { num: "284", label: "knowledge base entries" },
  { num: "GS1–GS4\n+ Essay", label: "papers covered" },
  { num: "Free", label: "no signup required" },
];

/* ─── Comparison rows ─────────────────────────────────────────────── */
const CMP_ROWS = [
  ["Scoring", "Vague 7/10 with no rubric", "7 dimensions mapped to UPSC marking scheme"],
  ["Patterns", "No UPSC examiner memory", "Calibrated on topper answers + examiner behavior"],
  ["Errors", "Hallucinations unchecked", "Factual error detection with specific corrections"],
  ["Feedback", "Generic improvement tips", "Dimension-specific, actionable guidance"],
  ["Cost", "ChatGPT Plus subscription", "Free, no signup"],
];

/* ─── Product areas ───────────────────────────────────────────────── */
const PRODUCTS = [
  { href: "/evaluate", label: "Answer Evaluation", desc: "Upload your answer sheet or type inline. Scored across 7 dimensions with factual error detection and suggested rewrites." },
  { href: "/mock-prelims", label: "Mock Prelims", desc: "Question-by-question MCQ practice with an answer key built on real PYQ patterns. Timed, scored, reviewed." },
  { href: "/mock-mains", label: "Mock Mains", desc: "Sequential mains practice — answer question by question, get evaluated after each, build a session score." },
];

/* ─── How it works steps ──────────────────────────────────────────── */
const STEPS = [
  { num: "01", title: "Upload or type", desc: "Handwritten PDF or type directly in the browser." },
  { num: "02", title: "AI reads it", desc: "Structure, substance, and intent — all analyzed." },
  { num: "03", title: "Scored across 7 dimensions", desc: "Every dimension mapped to UPSC marking behavior." },
  { num: "04", title: "Get specific feedback", desc: "Factual corrections, article citations, rewrite suggestions." },
];

/* ─── Blog posts (static for now) ────────────────────────────────── */
const BLOG_POSTS = [
  { slug: "how-upsc-examiners-score-gs2", title: "How UPSC examiners actually score GS2 answers", date: "Jul 1, 2026", tag: "Strategy" },
  { slug: "seven-dimensions-mains-score", title: "The 7 dimensions that decide your Mains score", date: "Jun 20, 2026", tag: "Answer Writing" },
];

export default function HomePage() {
  return (
    <div style={{ background: "var(--paper)", color: "var(--ink)", minHeight: "100vh" }}>
      <Nav />

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section style={{ padding: "88px 0 80px" }}>
        <div className="site-wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            {/* Left */}
            <div>
              <span className="eyebrow">AI trained on UPSC examiner patterns</span>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-4xl)", lineHeight: 1.05, letterSpacing: "-0.02em", color: "var(--ink)", marginBottom: 20 }}>
                Write like a topper.<br />Get scored like one.
              </h1>
              <p style={{ fontSize: 16, color: "var(--ink-muted)", lineHeight: 1.7, maxWidth: 420 }}>
                AI-powered UPSC Mains evaluation, calibrated on a decade of examiner behavior.
                Upload your answer or type it in. Get scored across 7 dimensions in under 2 minutes.
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
                <Link href="/evaluate" style={{ padding: "12px 24px", borderRadius: 4, background: "var(--accent)", color: "var(--accent-ink)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                  Evaluate an answer →
                </Link>
                <Link href="/mock-prelims" style={{ padding: "12px 24px", borderRadius: 4, border: "1px solid var(--hairline)", background: "transparent", color: "var(--ink-muted)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
                  Try Mock Prelims
                </Link>
              </div>
            </div>
            {/* Right — product mock */}
            <ScoreMock />
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────────────── */}
      <section style={{ borderTop: "1px solid var(--hairline)", borderBottom: "1px solid var(--hairline)" }}>
        <div className="site-wrap">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{ padding: "40px 24px", borderRight: i < STATS.length - 1 ? "1px solid var(--hairline)" : "none" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--ink)", lineHeight: 1.1, marginBottom: 6, whiteSpace: "pre-line" }}>{s.num}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="section">
        <div className="site-wrap">
          <span className="eyebrow">How it works</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-3xl)", letterSpacing: "-0.02em", color: "var(--ink)", marginBottom: 48 }}>
            From answer to insight in minutes
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
            {STEPS.map((s, i) => (
              <div key={s.num} style={{ paddingRight: 32, borderRight: i < STEPS.length - 1 ? "1px solid var(--hairline)" : "none", paddingLeft: i > 0 ? 32 : 0 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-4xl)", fontWeight: 900, color: "var(--hairline)", lineHeight: 1, marginBottom: 16 }}>{s.num}</div>
                <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)", marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY NOT GPT ───────────────────────────────────────────── */}
      <section className="section" style={{ borderTop: "1px solid var(--hairline)" }}>
        <div className="site-wrap">
          <span className="eyebrow">The difference</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-3xl)", letterSpacing: "-0.02em", color: "var(--ink)", marginBottom: 40 }}>
            Why not just use ChatGPT?
          </h2>
          <table className="cmp-table">
            <thead>
              <tr>
                <th style={{ width: "20%" }}></th>
                <th>Generic AI</th>
                <th style={{ color: "var(--success)" }}>Abhyaas AI</th>
              </tr>
            </thead>
            <tbody>
              {CMP_ROWS.map(([dim, generic, abhyaas]) => (
                <tr key={dim}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{dim}</td>
                  <td style={{ color: "var(--ink-muted)" }}>{generic}</td>
                  <td style={{ color: "var(--success)", fontWeight: 500 }}>{abhyaas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── PRODUCT AREAS ─────────────────────────────────────────── */}
      <section className="section" style={{ borderTop: "1px solid var(--hairline)" }}>
        <div className="site-wrap">
          <span className="eyebrow">What we build</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-3xl)", letterSpacing: "-0.02em", color: "var(--ink)", marginBottom: 40 }}>
            Tools for every part of Mains prep
          </h2>
          <div>
            {PRODUCTS.map(p => (
              <Link
                key={p.href}
                href={p.href}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 0", borderBottom: "1px solid var(--hairline)", textDecoration: "none", gap: 24 }}
              >
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-lg)", color: "var(--ink)", marginBottom: 4 }}>{p.label}</div>
                  <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6, maxWidth: 560 }}>{p.desc}</div>
                </div>
                <span style={{ color: "var(--ink-faint)", fontSize: 18, flexShrink: 0 }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG STRIP ────────────────────────────────────────────── */}
      <section className="section" style={{ borderTop: "1px solid var(--hairline)" }}>
        <div className="site-wrap">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
            <div>
              <span className="eyebrow">From the blog</span>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-2xl)", letterSpacing: "-0.02em", color: "var(--ink)" }}>
                Strategy, answer writing, insights
              </h2>
            </div>
            <Link href="/blog" style={{ fontSize: 13, color: "var(--ink-muted)", textDecoration: "none" }}>All posts →</Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
            {BLOG_POSTS.map((p, i) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} style={{ padding: "24px 0", paddingRight: i === 0 ? 40 : 0, paddingLeft: i === 1 ? 40 : 0, borderLeft: i === 1 ? "1px solid var(--hairline)" : "none", textDecoration: "none", display: "block" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>{p.tag}</span>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "var(--text-lg)", color: "var(--ink)", lineHeight: 1.35, marginBottom: 12 }}>{p.title}</div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)" }}>{p.date}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
