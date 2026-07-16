import Link from "next/link";
import EmailCapture from "./EmailCapture";

const COLS = [
  {
    heading: "Product",
    links: [
      { href: "/prelims", label: "Prelims" },
      { href: "/mains", label: "Mains" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/updates", label: "About" },
      { href: "https://tally.so/r/WO1Llk", label: "Feedback", external: true },
    ],
  },
  {
    heading: "Resources",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/updates", label: "Updates" },
      { href: "/prelims", label: "Sample Questions" },
    ],
  },
];

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--hairline)", paddingTop: 56, paddingBottom: 48, background: "var(--paper)", marginTop: 96 }}>
      <div className="site-wrap">
        {/* Top row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 48, paddingBottom: 48, borderBottom: "1px solid var(--hairline)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 4, border: "1px solid var(--hairline)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>A</div>
              <span style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>Abhyaas AI</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.65, maxWidth: 280 }}>
              UPSC Mains prep tools built on a decade of examiner behavior. Free, no signup.
            </p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: "var(--ink-muted)", marginBottom: 10, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Get UPSC prep insights in your inbox</p>
            <EmailCapture />
          </div>
        </div>

        {/* Link columns */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, marginBottom: 48 }}>
          {COLS.map(col => (
            <div key={col.heading}>
              <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-muted)", marginBottom: 14 }}>{col.heading}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map(l => (
                  <Link
                    key={l.href}
                    href={l.href}
                    target={"external" in l && l.external ? "_blank" : undefined}
                    rel={"external" in l && l.external ? "noopener noreferrer" : undefined}
                    style={{ fontSize: 13, color: "var(--ink-muted)", textDecoration: "none" }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>
          © 2026 Abhyaas AI. Built for UPSC aspirants, not investors.
        </p>
      </div>
    </footer>
  );
}
