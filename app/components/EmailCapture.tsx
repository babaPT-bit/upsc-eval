"use client";
import { useState } from "react";

export default function EmailCapture() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setEmail("");
  }

  if (submitted) {
    return (
      <p style={{ fontSize: 13, color: "var(--success)", marginTop: 20 }}>
        Done — we'll be in touch.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        placeholder="your@email.com"
        style={{
          padding: "10px 14px", borderRadius: 4,
          border: "1px solid var(--hairline)",
          background: "var(--surface)", color: "var(--ink)",
          fontSize: 14, fontFamily: "inherit", width: 240, outline: "none",
        }}
      />
      <button
        type="submit"
        style={{
          padding: "10px 20px", borderRadius: 4,
          background: "var(--accent)", color: "var(--accent-ink)",
          fontSize: 14, fontWeight: 600, border: "none",
          cursor: "pointer", fontFamily: "inherit",
        }}
      >
        Get early access
      </button>
    </form>
  );
}
