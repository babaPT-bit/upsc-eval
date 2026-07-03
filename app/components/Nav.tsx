"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/evaluate", label: "Evaluate" },
  { href: "/mock-prelims", label: "Mock Prelims" },
  { href: "/mock-mains", label: "Mock Mains" },
  { href: "/blog", label: "Blog" },
  { href: "/updates", label: "Updates" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "var(--paper)", borderBottom: "1px solid var(--hairline)",
      height: 52,
    }}>
      <div className="site-wrap" style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, borderRadius: 4, border: "1px solid var(--hairline)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--ink)", flexShrink: 0 }}>A</div>
          <span style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)", letterSpacing: "-0.01em" }}>Abhyaas AI</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", gap: 2, marginRight: 12 }}>
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link${pathname.startsWith(l.href) ? " active" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <Link href="/evaluate" style={{
            padding: "7px 16px", borderRadius: 4,
            background: "var(--accent)", color: "var(--accent-ink)",
            fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap",
          }}>
            Start Evaluating →
          </Link>
        </div>
      </div>
    </nav>
  );
}
