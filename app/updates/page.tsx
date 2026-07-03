import Nav from "../components/Nav";
import Footer from "../components/Footer";
import updatesData from "../../content/updates.json";

export const metadata = {
  title: "Updates — Abhyaas AI",
  description: "What's new in Abhyaas AI — feature releases, improvements, and fixes.",
};

const TAG_COLORS: Record<string, string> = {
  "New feature": "var(--success)",
  "Improvement": "var(--accent)",
  "Fix": "var(--warning)",
  "Launch": "var(--accent)",
  "Beta": "var(--ink-muted)",
};

export default function UpdatesPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
      <Nav />
      <div className="site-wrap" style={{ paddingTop: 64, paddingBottom: 96, maxWidth: 680 }}>
        <span className="eyebrow">Changelog</span>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-3xl)", letterSpacing: "-0.02em", marginBottom: 8 }}>
          What&apos;s new
        </h1>
        <p style={{ color: "var(--ink-muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 56 }}>
          Every release, improvement, and fix — in reverse chronological order.
        </p>

        <div>
          {updatesData.map((entry, i) => (
            <div key={entry.version} style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 32, paddingBottom: 48, marginBottom: i < updatesData.length - 1 ? 48 : 0, borderBottom: i < updatesData.length - 1 ? "1px solid var(--hairline)" : "none" }}>
              {/* Left — meta */}
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)", marginBottom: 8 }}>{entry.date}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500, color: "var(--ink-muted)" }}>{entry.version}</div>
              </div>

              {/* Right — content */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "var(--ink)" }}>{entry.title}</h2>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: TAG_COLORS[entry.tag] ?? "var(--ink-muted)", padding: "2px 8px", border: `1px solid ${TAG_COLORS[entry.tag] ?? "var(--hairline)"}`, borderRadius: 2, whiteSpace: "nowrap", flexShrink: 0 }}>{entry.tag}</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.75 }}>{entry.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
