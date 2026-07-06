import Nav from "../components/Nav";
import Footer from "../components/Footer";
import EmailCapture from "../components/EmailCapture";

export const metadata = {
  title: "Your progress — Abhyaas AI",
  description: "Track your weak areas across Prelims subjects and Mains dimensions. Coming soon with accounts.",
};

const COACH_LABEL = "your coach";

export default function ProgressPage() {
  return (
    <div style={{ background: "var(--paper)", color: "var(--ink)", minHeight: "100vh" }}>
      <Nav />

      <section style={{ padding: "88px 0 80px" }}>
        <div className="site-wrap">
          <span className="eyebrow">Your progress</span>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "var(--text-4xl)", lineHeight: 1.05,
            letterSpacing: "-0.02em", color: "var(--ink)",
            marginBottom: 20, maxWidth: 640,
          }}>
            Your weak areas, tracked across every attempt
          </h1>
          <p style={{ fontSize: 16, color: "var(--ink-muted)", lineHeight: 1.75, maxWidth: 560, marginBottom: 32 }}>
            This is the future home of your coaching dashboard. It needs an account — which isn't built yet.
            Here's what it will become.
          </p>

          <div style={{ maxWidth: 640 }}>
            {/* What it will become */}
            <div style={{
              border: "1px solid var(--hairline)", borderRadius: 6,
              padding: "32px 28px", background: "var(--surface)", marginBottom: 28,
            }}>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 11,
                color: "var(--accent)", textTransform: "uppercase",
                letterSpacing: "0.08em", marginBottom: 20,
              }}>
                What this page will become
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  {
                    label: "Prelims",
                    text: `A running picture of which subjects and question types you keep getting wrong — Polity, Environment, Science & Technology — so your next practice session targets your gaps, not the full syllabus.`,
                  },
                  {
                    label: "Mains",
                    text: `A dimension-by-dimension breakdown across every answer you've written — which scoring dimension you're consistently weak on, which directive you keep half-answering, which paper is dragging your total down.`,
                  },
                  {
                    label: "Coach",
                    text: `Based on your pattern, ${COACH_LABEL} will suggest what to practise next — not a generic recommendation, but a specific subject or dimension derived from your own answer history.`,
                  },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex", gap: 20, alignItems: "flex-start",
                      paddingTop: i > 0 ? 20 : 0,
                      paddingBottom: i < 2 ? 20 : 0,
                      borderBottom: i < 2 ? "1px solid var(--hairline)" : "none",
                    }}
                  >
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 11,
                      color: "var(--ink-faint)", flexShrink: 0, marginTop: 3,
                      minWidth: 40,
                    }}>
                      {item.label}
                    </span>
                    <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.7 }}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.7, marginBottom: 12 }}>
              None of this requires buying anything. It requires an account so Abhyaas can link
              your attempts together over time. Accounts are the next thing being built.
            </p>
            <p style={{ fontSize: 13, color: "var(--ink-faint)", marginBottom: 28 }}>
              In the meantime, every evaluation at{" "}
              <a href="/evaluate" style={{ color: "var(--accent)", textDecoration: "none" }}>/evaluate</a>
              {" "}and every mock you complete already generates the per-answer feedback that will feed into
              this dashboard once accounts arrive.
            </p>

            {/* Email capture */}
            <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 28 }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", marginBottom: 4 }}>
                Get early access when accounts open
              </p>
              <p style={{ fontSize: 13, color: "var(--ink-faint)" }}>
                Leave your email and we'll reach out as soon as this goes live.
              </p>
              <EmailCapture />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
