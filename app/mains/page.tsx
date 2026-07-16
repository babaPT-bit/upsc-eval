import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

export const metadata = {
  title: "Mains — Abhyaas AI",
  description: "Practise for the written paper — deep answer evaluation, or a full timed question set.",
};

function IconEdit({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function IconClock({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </svg>
  );
}

const MODES = [
  {
    title: "Evaluate an answer",
    desc: "Write or upload one answer. Key points, directive check, factual errors, a calibrated score, and a marked-up sheet back.",
    meta: "deep feedback · one answer",
    href: "/evaluate",
    icon: IconEdit,
    featured: true,
  },
  {
    title: "Timed test",
    desc: "Answer a set question-by-question under a per-question timer, evaluated after each. Exam simulation for Mains.",
    meta: "question set · timed",
    href: "/mock-mains",
    icon: IconClock,
    featured: false,
  },
];

export default function MainsHubPage() {
  return (
    <div style={{ background: "var(--paper)", color: "var(--ink)", minHeight: "100vh" }}>
      <Nav />

      <section style={{ padding: "88px 0 80px" }}>
        <div className="site-wrap">
          <span className="eyebrow">Mains hub</span>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "var(--text-4xl)", lineHeight: 1.05,
            letterSpacing: "-0.02em", color: "var(--ink)",
            marginBottom: 20, maxWidth: 640,
          }}>
            Practise for the written paper
          </h1>
          <p style={{ fontSize: 16, color: "var(--ink-muted)", lineHeight: 1.75, maxWidth: 560, marginBottom: 48 }}>
            Go deep on one answer, or write a full set against the clock.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {MODES.map(mode => {
              const Icon = mode.icon;
              return (
                <Link
                  key={mode.href}
                  href={mode.href}
                  style={{
                    display: "block", textDecoration: "none",
                    background: "var(--surface)",
                    border: mode.featured ? "2px solid var(--accent)" : "1px solid var(--hairline)",
                    borderRadius: 8, padding: "20px 22px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: "var(--accent-bg)", color: "var(--accent)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon />
                    </div>
                    {mode.featured && (
                      <span style={{
                        background: "var(--accent-bg)", color: "var(--accent)",
                        fontSize: 11, fontWeight: 600, borderRadius: 4, padding: "3px 8px",
                      }}>
                        Start here
                      </span>
                    )}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 16, color: "var(--ink)", marginBottom: 8 }}>
                    {mode.title}
                  </div>
                  <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.6, marginBottom: 16 }}>
                    {mode.desc}
                  </p>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)" }}>
                    {mode.meta}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
