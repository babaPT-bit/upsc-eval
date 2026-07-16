import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

export const metadata = {
  title: "Prelims — Abhyaas AI",
  description: "Practise for the objective paper — MCQ drills by subject, previous-year questions, and a full timed mock.",
};

function IconTarget({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  );
}
function IconArchive({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="5" rx="1" />
      <path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" />
      <line x1="10" y1="13" x2="14" y2="13" />
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
    title: "MCQ practice",
    desc: "Untimed drills by subject with instant explanations. Build accuracy before you add a clock.",
    meta: "by subject · instant answers",
    href: "/mock-prelims?mode=knowledge",
    icon: IconTarget,
  },
  {
    title: "PYQs",
    desc: "Actual previous-year Prelims questions, by year and subject. Practise what's really been asked.",
    meta: "past papers · verified",
    href: "/mock-prelims?source=pyq",
    icon: IconArchive,
  },
  {
    title: "Timed test",
    desc: "Full-length paper on one shared clock. Real pacing, exam-day pressure.",
    meta: "full mock · timed",
    href: "/mock-prelims?mode=mock",
    icon: IconClock,
  },
];

export default function PrelimsHubPage() {
  return (
    <div style={{ background: "var(--paper)", color: "var(--ink)", minHeight: "100vh" }}>
      <Nav />

      <section style={{ padding: "88px 0 80px" }}>
        <div className="site-wrap">
          <span className="eyebrow">Prelims hub</span>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "var(--text-4xl)", lineHeight: 1.05,
            letterSpacing: "-0.02em", color: "var(--ink)",
            marginBottom: 20, maxWidth: 640,
          }}>
            Practise for the objective paper
          </h1>
          <p style={{ fontSize: 16, color: "var(--ink-muted)", lineHeight: 1.75, maxWidth: 560, marginBottom: 48 }}>
            Pick where you are — drilling, revising past papers, or simulating the real thing.
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
                    background: "var(--surface)", border: "1px solid var(--hairline)",
                    borderRadius: 8, padding: "20px 22px",
                  }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: "var(--accent-bg)", color: "var(--accent)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 16,
                  }}>
                    <Icon />
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
