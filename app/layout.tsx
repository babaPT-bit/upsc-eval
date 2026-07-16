import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import ThemeProvider from "./components/ThemeProvider";
import "./globals.css";

// Runs before hydration so the correct theme class is on <html> from the very
// first paint — avoids a light→dark (or dark→light) flash on reload. Kept as
// a plain string so it can be inlined via dangerouslySetInnerHTML.
const ANTI_FOUC_SCRIPT = `
(function () {
  try {
    var stored = window.localStorage.getItem("abhyaas-theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`;

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Abhyaas AI — UPSC Mains Prep",
  description: "AI-powered UPSC Mains answer evaluation and practice. Scored across 7 dimensions, calibrated on examiner behavior. Free, no signup.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: ANTI_FOUC_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
