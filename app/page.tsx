import Link from "next/link";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import EmailCapture from "./components/EmailCapture";

const COACH_LABEL = "your coach";

/* ─── Section 4: comparison rows ───────────────────────────────────── */
const CMP_ROWS: [string, string, string, boolean?][] = [
  ["Scoring", "Vague 7/10 with no rubric", "7 dimensions mapped to UPSC marking scheme"],
  ["Calibration", "No UPSC examiner memory", "Calibrated on topper answers and examiner behavior"],
  ["Errors", "Hallucinations unchecked", "Factual error detection with specific corrections"],
  ["Directives", "No awareness of 'examine' vs 'critically analyse'", "Directive-specific checks for every question"],
  ["Memory", "Forgets every answer the moment you close the tab", `Remembers your weak areas — coming with accounts`, true],
];

/* ─── Blog posts (static) ───────────────────────────────────────────── */
const BLOG_POSTS = [
  { slug: "how-upsc-examiners-score-gs2", title: "How UPSC examiners actually score GS2 answers", date: "Jul 1, 2026", tag: "Strategy" },
  { slug: "seven-dimensions-mains-score", title: "The 7 dimensions that decide your Mains score", date: "Jun 20, 2026", tag: "Answer Writing" },
];

export default function HomePage() {
  return (
    <div style={{ background: "var(--paper)", color: "var(--ink)", minHeight: "100vh" }}>
      <Nav />

      {/* ── SECTION 1: HERO ─────────────────────────────────────────── */}
      <section style={{ padding: "88px 0 80px" }}>
        <div className="site-wrap">
          <span className="eyebrow">Personalised UPSC prep</span>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "var(--text-4xl)", lineHeight: 1.05,
            letterSpacing: "-0.02em", color: "var(--ink)",
            marginBottom: 20, maxWidth: 700,
          }}>
            Every brain is different.<br />Why train the same?
          </h1>
          <p style={{ fontSize: 16, color: "var(--ink-muted)", lineHeight: 1.75, maxWidth: 560, marginBottom: 32 }}>
            Toppers didn't prep generically — they found their own weak spots and drilled them.
            Abhyaas is an examiner-grade evaluator that learns how <em>you</em> lose marks and coaches that,
            across every answer you write. For Prelims and Mains.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/evaluate" style={{
              padding: "12px 24px", borderRadius: 4,
              background: "var(--accent)", color: "var(--accent-ink)",
              fontSize: 14, fontWeight: 600, textDecoration: "none",
            }}>
              Evaluate an answer →
            </Link>
            <a href="#how-it-works" style={{
              padding: "12px 24px", borderRadius: 4,
              border: "1px solid var(--hairline)", background: "transparent",
              color: "var(--ink-muted)", fontSize: 14, fontWeight: 500,
              textDecoration: "none",
            }}>
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: THE PROBLEM ──────────────────────────────────── */}
      <section className="section" style={{ borderTop: "1px solid var(--hairline)" }}>
        <div className="site-wrap">
          <span className="eyebrow">The problem</span>
          <h2 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "var(--text-3xl)", letterSpacing: "-0.02em",
            color: "var(--ink)", marginBottom: 40,
          }}>
            Generic prep treats everyone the same
          </h2>
          <div style={{ maxWidth: 640 }}>
            {[
              "Coaching centres hand 500 aspirants the identical test series and the same generic remarks. The remark 'needs more depth' means nothing to someone who doesn't know which dimension to work on.",
              "GPT gives everyone a vague 7/10 and forgets you the moment you close the tab. There is no memory, no pattern, no calibration to UPSC examiner behaviour.",
              "Toppers didn't prep generically — they knew exactly where they were weak and drilled it. That kind of self-awareness used to require a personal mentor. It shouldn't.",
            ].map((text, i) => (
              <div
                key={i}
                style={{
                  padding: "24px 0",
                  borderTop: i === 0 ? "1px solid var(--hairline)" : "none",
                  borderBottom: "1px solid var(--hairline)",
                  display: "flex", gap: 20, alignItems: "flex-start",
                }}
              >
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 11,
                  color: "var(--ink-faint)", marginTop: 3, flexShrink: 0,
                }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p style={{ fontSize: 15, color: "var(--ink-muted)", lineHeight: 1.7 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: THE LOOP ─────────────────────────────────────── */}
      <section id="how-it-works" className="section" style={{ borderTop: "1px solid var(--hairline)" }}>
        <div className="site-wrap">
          <span className="eyebrow">How Abhyaas works</span>
          <h2 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "var(--text-3xl)", letterSpacing: "-0.02em",
            color: "var(--ink)", marginBottom: 48,
          }}>
            A loop that gets to know you
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}>
            {[
              { num: "01", title: "Write an answer", desc: "Type directly, or upload a photo of your handwritten sheet. Abhyaas reads your writing." },
              { num: "02", title: "Get examiner-grade evaluation", desc: "Key points, directive compliance, factual errors, calibrated score — not a vague 7/10." },
              { num: "03", title: "Abhyaas remembers", desc: "Where you lost marks, which dimension, which subject. Every attempt builds a picture." },
              { num: "04", title: "Your next practice targets that", desc: "The loop closes. You drill what you're actually weak on, not what everyone else is practising." },
            ].map((s, i) => (
              <div
                key={s.num}
                style={{
                  paddingRight: 32,
                  borderRight: i < 3 ? "1px solid var(--hairline)" : "none",
                  paddingLeft: i > 0 ? 32 : 0,
                }}
              >
                <div style={{
                  fontFamily: "var(--font-display)", fontSize: "var(--text-4xl)",
                  fontWeight: 900, color: "var(--hairline)", lineHeight: 1, marginBottom: 16,
                }}>
                  {s.num}
                </div>
                <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)", marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.65 }}>{s.desc}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "var(--ink-faint)", marginTop: 32, maxWidth: 560 }}>
            Steps 1–2 work today, for free, with no account. Steps 3–4 — the memory and the targeting — are what a signed-in account unlocks. See below.
          </p>
        </div>
      </section>

      {/* ── SECTION 4: PROOF IT'S REAL TODAY ───────────────────────── */}
      <section className="section" style={{ borderTop: "1px solid var(--hairline)" }}>
        <div className="site-wrap">
          <span className="eyebrow">What works right now</span>
          <h2 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "var(--text-3xl)", letterSpacing: "-0.02em",
            color: "var(--ink)", marginBottom: 40,
          }}>
            Feedback GPT structurally can't give
          </h2>
          <table className="cmp-table">
            <thead>
              <tr>
                <th style={{ width: "18%" }}></th>
                <th>Generic AI</th>
                <th style={{ color: "var(--success)" }}>Abhyaas AI</th>
              </tr>
            </thead>
            <tbody>
              {CMP_ROWS.map(([dim, generic, abhyaas, bridge]) => (
                <tr key={dim} style={bridge ? { borderTop: "2px solid var(--hairline)" } : {}}>
                  <td style={{
                    fontFamily: "var(--font-mono)", fontSize: 12,
                    color: bridge ? "var(--ink)" : "var(--ink-muted)",
                    textTransform: "uppercase", letterSpacing: "0.05em",
                    fontWeight: bridge ? 600 : 400,
                  }}>
                    {dim}
                  </td>
                  <td style={{ color: "var(--ink-muted)" }}>{generic}</td>
                  <td style={{
                    color: bridge ? "var(--accent)" : "var(--success)",
                    fontWeight: 500,
                  }}>
                    {abhyaas}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 13, color: "var(--ink-faint)", marginTop: 16 }}>
            The last row is the vision — account-based memory is what's coming.
          </p>
        </div>
      </section>

      {/* ── SECTION 5: PERSONALISED FOR BOTH PAPERS ─────────────────── */}
      <section className="section" style={{ borderTop: "1px solid var(--hairline)" }}>
        <div className="site-wrap">
          <span className="eyebrow">Prelims and Mains</span>
          <h2 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "var(--text-3xl)", letterSpacing: "-0.02em",
            color: "var(--ink)", marginBottom: 48,
          }}>
            It learns you differently for each paper
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
            <div style={{ paddingRight: 48 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Prelims</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "var(--text-xl)", color: "var(--ink)", marginBottom: 16, lineHeight: 1.3 }}>
                Know which subjects you keep getting wrong
              </h3>
              <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.75, marginBottom: 16 }}>
                Over time, Abhyaas will surface which subjects and question types you consistently miss —
                Polity, Environment, Science &amp; Tech — so you drill the right thing instead of
                re-reading everything at the same pace as everyone else.
              </p>
              <p style={{ fontSize: 13, color: "var(--ink-faint)", fontStyle: "italic" }}>
                Prelims practice is available now. Subject-level tracking comes with accounts.
              </p>
              <Link href="/mock-prelims" style={{ display: "inline-block", marginTop: 20, fontSize: 13, color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
                Try Mock Prelims →
              </Link>
            </div>
            <div style={{ paddingLeft: 48, borderLeft: "1px solid var(--hairline)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Mains</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "var(--text-xl)", color: "var(--ink)", marginBottom: 16, lineHeight: 1.3 }}>
                See your recurring patterns, not just your last score
              </h3>
              <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.75, marginBottom: 16 }}>
                Over time, Abhyaas will surface your recurring patterns: the dimension you're consistently
                weak on, the directive you keep half-answering, the paper that's dragging your total down.
                That's the difference between practising and improving.
              </p>
              <p style={{ fontSize: 13, color: "var(--ink-faint)", fontStyle: "italic" }}>
                Mains evaluation works now. Pattern tracking comes with accounts.
              </p>
              <Link href="/evaluate" style={{ display: "inline-block", marginTop: 20, fontSize: 13, color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
                Evaluate an answer →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: COACH VISION + EARLY ACCESS ──────────────────── */}
      <section className="section" style={{ borderTop: "1px solid var(--hairline)" }}>
        <div className="site-wrap">
          <span className="eyebrow">What's coming</span>
          <h2 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "var(--text-3xl)", letterSpacing: "-0.02em",
            color: "var(--ink)", marginBottom: 20, maxWidth: 640,
          }}>
            Soon, {COACH_LABEL} will tell you what to work on next
          </h2>
          <p style={{ fontSize: 15, color: "var(--ink-muted)", lineHeight: 1.75, maxWidth: 560, marginBottom: 8 }}>
            As accounts arrive, every answer you write becomes a data point. Abhyaas builds a picture of
            your specific weak areas — by subject, by dimension, by directive — and coaches them directly.
            The way a personal mentor would, not a generic test series.
          </p>
          <p style={{ fontSize: 13, color: "var(--ink-faint)", marginBottom: 0 }}>
            Leave your email to be first in when accounts open.
          </p>
          <EmailCapture />
        </div>
      </section>

      {/* ── SECTION 7: BLOG + UPDATES STRIP ─────────────────────────── */}
      <section className="section" style={{ borderTop: "1px solid var(--hairline)" }}>
        <div className="site-wrap">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 }}>
            <div>
              <span className="eyebrow">From the blog</span>
              <h2 style={{
                fontFamily: "var(--font-display)", fontWeight: 700,
                fontSize: "var(--text-2xl)", letterSpacing: "-0.02em", color: "var(--ink)",
              }}>
                Strategy, answer writing, insights
              </h2>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <Link href="/updates" style={{ fontSize: 13, color: "var(--ink-muted)", textDecoration: "none" }}>Updates →</Link>
              <Link href="/blog" style={{ fontSize: 13, color: "var(--ink-muted)", textDecoration: "none" }}>All posts →</Link>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
            {BLOG_POSTS.map((p, i) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                style={{
                  padding: "24px 0",
                  paddingRight: i === 0 ? 40 : 0,
                  paddingLeft: i === 1 ? 40 : 0,
                  borderLeft: i === 1 ? "1px solid var(--hairline)" : "none",
                  textDecoration: "none",
                  display: "block",
                }}
              >
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 11,
                  color: "var(--accent)", textTransform: "uppercase",
                  letterSpacing: "0.06em", display: "block", marginBottom: 8,
                }}>
                  {p.tag}
                </span>
                <div style={{
                  fontFamily: "var(--font-display)", fontWeight: 500,
                  fontSize: "var(--text-lg)", color: "var(--ink)",
                  lineHeight: 1.35, marginBottom: 12,
                }}>
                  {p.title}
                </div>
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
