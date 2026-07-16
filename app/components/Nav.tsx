"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

const NAV_LINKS = [
  { href: "/prelims", label: "Prelims" },
  { href: "/mains", label: "Mains" },
  { href: "/progress", label: "Progress" },
];

const RESOURCE_LINKS = [
  { href: "/blog", label: "Blog" },
  { href: "/updates", label: "Updates" },
];

/* ── Minimal inline icons (matches the app's hand-rolled stroke-icon style) ── */
function IconChevronDown({ size = 12, open }: { size?: number; open: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s", flexShrink: 0 }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function IconMenu({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
function IconX({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconMoon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function IconSun({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4.5" />
      <line x1="12" y1="1.5" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22.5" />
      <line x1="1.5" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22.5" y2="12" />
      <line x1="4.4" y1="4.4" x2="6.1" y2="6.1" /><line x1="17.9" y1="17.9" x2="19.6" y2="19.6" />
      <line x1="4.4" y1="19.6" x2="6.1" y2="17.9" /><line x1="17.9" y1="6.1" x2="19.6" y2="4.4" />
    </svg>
  );
}

function CtaButton({ href, style }: { href: string; style?: React.CSSProperties }) {
  return (
    <Link href={href} style={{
      padding: "7px 16px", borderRadius: 4,
      background: "var(--accent)", color: "var(--accent-ink)",
      fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap",
      ...style,
    }}>
      Try it free
    </Link>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const { darkMode, toggle } = useTheme();
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const resourcesRef = useRef<HTMLDivElement>(null);

  const resourcesActive = RESOURCE_LINKS.some(l => pathname.startsWith(l.href));

  // Close the Resources dropdown on outside click or Escape.
  useEffect(() => {
    if (!resourcesOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setResourcesOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [resourcesOpen]);

  // Close the mobile drawer on Escape.
  useEffect(() => {
    if (!mobileOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
    setResourcesOpen(false);
  }, [pathname]);

  const ThemeToggleButton = ({ size = 32 }: { size?: number }) => (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      style={{
        width: size, height: size, borderRadius: 4,
        border: "1px solid var(--hairline)", background: "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--ink-muted)", cursor: "pointer", flexShrink: 0,
      }}
    >
      {darkMode ? <IconSun /> : <IconMoon />}
    </button>
  );

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

        {/* Desktop cluster */}
        <div className="nav-desktop" style={{ alignItems: "center", gap: 6 }}>
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

            {/* Resources dropdown */}
            <div ref={resourcesRef} style={{ position: "relative" }}>
              <button
                onClick={() => setResourcesOpen(o => !o)}
                aria-haspopup="true"
                aria-expanded={resourcesOpen}
                className={`nav-link${resourcesActive ? " active" : ""}`}
                style={{ display: "inline-flex", alignItems: "center", gap: 4, border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}
              >
                Resources
                <IconChevronDown open={resourcesOpen} />
              </button>
              {resourcesOpen && (
                <div
                  role="menu"
                  style={{
                    position: "absolute", top: "calc(100% + 6px)", right: 0, minWidth: 140,
                    background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 6,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)", padding: 4, zIndex: 60,
                  }}
                >
                  {RESOURCE_LINKS.map(l => (
                    <Link
                      key={l.href}
                      href={l.href}
                      role="menuitem"
                      onClick={() => setResourcesOpen(false)}
                      style={{
                        display: "block", padding: "8px 12px", borderRadius: 4,
                        fontSize: 13, textDecoration: "none",
                        color: pathname.startsWith(l.href) ? "var(--ink)" : "var(--ink-muted)",
                        fontWeight: pathname.startsWith(l.href) ? 500 : 400,
                        background: pathname.startsWith(l.href) ? "var(--accent-bg)" : "transparent",
                      }}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <ThemeToggleButton />
          <CtaButton href="/evaluate" style={{ marginLeft: 6 }} />
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setMobileOpen(true)}
          aria-label="Menu"
          aria-expanded={mobileOpen}
          style={{
            width: 32, height: 32, borderRadius: 4, border: "1px solid var(--hairline)",
            background: "transparent", alignItems: "center", justifyContent: "center",
            color: "var(--ink-muted)", cursor: "pointer", flexShrink: 0,
          }}
        >
          <IconMenu />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            style={{ position: "fixed", inset: 0, background: "color-mix(in srgb, var(--ink) 45%, transparent)", zIndex: 70 }}
          />
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0, width: "min(84vw, 320px)",
              background: "var(--paper)", borderLeft: "1px solid var(--hairline)",
              zIndex: 80, display: "flex", flexDirection: "column",
              padding: "16px 20px", overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                style={{ width: 32, height: 32, borderRadius: 4, border: "1px solid var(--hairline)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-muted)", cursor: "pointer" }}
              >
                <IconX />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 20 }}>
              {[...NAV_LINKS, ...RESOURCE_LINKS].map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: "12px 8px", borderRadius: 4, fontSize: 15, textDecoration: "none",
                    color: pathname.startsWith(l.href) ? "var(--ink)" : "var(--ink-muted)",
                    fontWeight: pathname.startsWith(l.href) ? 600 : 400,
                    background: pathname.startsWith(l.href) ? "var(--accent-bg)" : "transparent",
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--hairline)" }}>
              <ThemeToggleButton />
              <CtaButton href="/evaluate" style={{ flex: 1, textAlign: "center" }} />
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
