"use client";
import { useState, useRef, useEffect, useCallback } from "react";

const API_URL = "https://pranshu2024-upsc-answer-evaluator.hf.space/evaluate";

const LOADING_STEPS = [
  "Uploading PDF...",
  "Extracting text from answers...",
  "Evaluating against UPSC standards...",
  "Generating detailed feedback...",
];

const DIMENSIONS = [
  { key: "introduction", label: "Introduction" },
  { key: "content_accuracy", label: "Content Accuracy" },
  { key: "structure_flow", label: "Structure & Flow" },
  { key: "upsc_keywords", label: "UPSC Keywords" },
  { key: "conclusion", label: "Conclusion" },
];

function scoreColor(pct) {
  if (pct >= 75) return "#22c55e";
  if (pct >= 50) return "#f59e0b";
  return "#ef4444";
}

function ScoreRing({ score, maxScore = 250, size = 140 }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min((score / maxScore) * 100, 100);
  const offset = circumference - (pct / 100) * circumference;
  const color = scoreColor(pct);

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={10}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text
        x={size / 2}
        y={size / 2 + 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize={size * 0.18}
        fontWeight={700}
        fontFamily="Outfit, sans-serif"
        style={{ transform: `rotate(90deg) translate(0, -${size}px)` }}
      >
        {score}
      </text>
      <text
        x={size / 2}
        y={size / 2 + size * 0.14}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(255,255,255,0.45)"
        fontSize={size * 0.1}
        fontFamily="DM Sans, sans-serif"
        style={{ transform: `rotate(90deg) translate(0, -${size}px)` }}
      >
        /{maxScore}
      </text>
    </svg>
  );
}

function ScoreBar({ label, value, max = 20 }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = scoreColor(pct);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontFamily: "DM Sans, sans-serif", opacity: 0.85 }}>{label}</span>
        <span style={{ fontSize: 13, fontFamily: "JetBrains Mono, monospace", color }}>
          {value}/{max}
        </span>
      </div>
      <div style={{ height: 7, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: 999,
            transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
    </div>
  );
}

export default function UPSCEvaluator() {
  const [dark, setDark] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [results, setResults] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(0);
  const [selectedTab, setSelectedTab] = useState("scores");
  const fileInputRef = useRef(null);
  const progressRef = useRef(null);

  // CSS variable theme
  const theme = dark
    ? {
        "--bg": "#0a0a0f",
        "--card": "#1a1a26",
        "--card2": "#12121c",
        "--accent": "#6366f1",
        "--accent-dim": "rgba(99,102,241,0.15)",
        "--text": "#e8e8f0",
        "--text-dim": "rgba(232,232,240,0.55)",
        "--border": "rgba(255,255,255,0.07)",
        "--blob1": "rgba(99,102,241,0.18)",
        "--blob2": "rgba(139,92,246,0.12)",
        "--shadow": "0 8px 40px rgba(0,0,0,0.5)",
      }
    : {
        "--bg": "#f5f5f0",
        "--card": "#ffffff",
        "--card2": "#f0f0eb",
        "--accent": "#4f46e5",
        "--accent-dim": "rgba(79,70,229,0.1)",
        "--text": "#1a1a2e",
        "--text-dim": "rgba(26,26,46,0.55)",
        "--border": "rgba(0,0,0,0.08)",
        "--blob1": "rgba(79,70,229,0.12)",
        "--blob2": "rgba(139,92,246,0.08)",
        "--shadow": "0 8px 40px rgba(0,0,0,0.1)",
      };

  const startProgress = useCallback(() => {
    let val = 0;
    const tick = () => {
      val += Math.random() * 1.5 * (1 - val / 90);
      if (val >= 90) val = 90;
      setProgress(Math.floor(val));
      const delay = 300 + Math.random() * 400;
      progressRef.current = setTimeout(tick, delay);
    };
    progressRef.current = setTimeout(tick, 300);
  }, []);

  const stopProgress = useCallback(() => {
    if (progressRef.current) clearTimeout(progressRef.current);
    setProgress(100);
  }, []);

  const advanceStep = useCallback(() => {
    let step = 0;
    const next = () => {
      step++;
      if (step < LOADING_STEPS.length) {
        setLoadingStep(step);
        setTimeout(next, 1800 + Math.random() * 800);
      }
    };
    setLoadingStep(0);
    setTimeout(next, 1800 + Math.random() * 800);
  }, []);

  const handleFile = (f) => {
    if (f && f.type === "application/pdf") setFile(f);
    else alert("Please upload a PDF file.");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setLoadingStep(0);
    setResults(null);
    startProgress();
    advanceStep();

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(API_URL, { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `HTTP ${res.status}`);
      }
      const data = await res.json();
      stopProgress();
      await new Promise((r) => setTimeout(r, 500));
      setResults(data);
      setSelectedAnswer(0);
      setSelectedTab("scores");
    } catch (err) {
      stopProgress();
      alert("Evaluation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => { if (progressRef.current) clearTimeout(progressRef.current); };
  }, []);

  const answers = results?.answers ?? [];
  const overall = results?.overall_score ?? results?.overall ?? null;
  const ans = answers[selectedAnswer] ?? null;

  const TABS = [
    { id: "scores", label: "Scores" },
    { id: "errors", label: "Factual Errors" },
    { id: "improvements", label: "Improvements" },
    { id: "text", label: "Extracted Text" },
  ];

  return (
    <div
      style={{
        ...theme,
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "DM Sans, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient blobs */}
      <div
        style={{
          position: "fixed", top: "-10%", left: "-5%",
          width: 500, height: 500, borderRadius: "50%",
          background: "var(--blob1)", filter: "blur(100px)",
          pointerEvents: "none", zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed", bottom: "-10%", right: "-5%",
          width: 600, height: 600, borderRadius: "50%",
          background: "var(--blob2)", filter: "blur(120px)",
          pointerEvents: "none", zIndex: 0,
        }}
      />

      {/* Header */}
      <header
        style={{
          position: "relative", zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 32px",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(12px)",
          background: dark ? "rgba(10,10,15,0.7)" : "rgba(245,245,240,0.7)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "var(--accent)", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 18, fontFamily: "Outfit, sans-serif", fontWeight: 700,
              color: "#fff",
            }}
          >
            U
          </div>
          <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 20 }}>
            UPSCEval
          </span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {results && (
            <button
              onClick={() => { setResults(null); setFile(null); setProgress(0); }}
              style={{
                padding: "8px 18px", borderRadius: 8, border: "1px solid var(--accent)",
                background: "var(--accent-dim)", color: "var(--accent)",
                fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 14,
                cursor: "pointer",
              }}
            >
              New Upload
            </button>
          )}
          <button
            onClick={() => setDark(!dark)}
            style={{
              width: 40, height: 40, borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--card)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}
            title="Toggle theme"
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <main
        style={{
          position: "relative", zIndex: 10,
          maxWidth: 860, margin: "0 auto",
          padding: "40px 20px 60px",
        }}
      >
        {/* Upload page */}
        {!results && !loading && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h1
                style={{
                  fontFamily: "Outfit, sans-serif", fontWeight: 800,
                  fontSize: "clamp(28px,5vw,48px)", margin: "0 0 14px",
                  background: dark
                    ? "linear-gradient(135deg,#e8e8f0 0%,#6366f1 100%)"
                    : "linear-gradient(135deg,#1a1a2e 0%,#4f46e5 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}
              >
                UPSC Mains Evaluator
              </h1>
              <p style={{ fontSize: 16, color: "var(--text-dim)", maxWidth: 480, margin: "0 auto" }}>
                Upload your handwritten or typed answer PDF and get instant AI-powered feedback with dimension-wise scoring.
              </p>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragActive ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 20,
                background: dragActive ? "var(--accent-dim)" : "var(--card)",
                padding: "56px 32px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "var(--shadow)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
              {file ? (
                <div>
                  <p style={{ fontFamily: "Outfit, sans-serif", fontWeight: 600, fontSize: 18, margin: "0 0 6px" }}>
                    {file.name}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--text-dim)" }}>
                    {(file.size / 1024).toFixed(1)} KB — click to change
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ fontFamily: "Outfit, sans-serif", fontWeight: 600, fontSize: 18, margin: "0 0 8px" }}>
                    Drag & drop your PDF here
                  </p>
                  <p style={{ fontSize: 14, color: "var(--text-dim)" }}>or click to browse</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>

            {file && (
              <div style={{ textAlign: "center", marginTop: 28 }}>
                <button
                  onClick={handleUpload}
                  style={{
                    padding: "14px 48px", borderRadius: 12, border: "none",
                    background: "var(--accent)", color: "#fff",
                    fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 16,
                    cursor: "pointer", boxShadow: "0 4px 24px rgba(99,102,241,0.35)",
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = "none"; }}
                >
                  Evaluate Answers →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading page */}
        {loading && (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 56, marginBottom: 24 }}>⚙️</div>
            <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 28, marginBottom: 8 }}>
              Evaluating your answers
            </h2>
            <p style={{ color: "var(--text-dim)", marginBottom: 48, fontSize: 15 }}>
              This usually takes 20–60 seconds
            </p>

            {/* Progress bar */}
            <div
              style={{
                maxWidth: 480, margin: "0 auto 36px",
                height: 8, borderRadius: 999,
                background: "var(--card)",
                overflow: "hidden",
                boxShadow: "var(--shadow)",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, var(--accent), #8b5cf6)",
                  borderRadius: 999,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
            <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 40 }}>
              {progress}%
            </p>

            {/* Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 360, margin: "0 auto" }}>
              {LOADING_STEPS.map((step, i) => {
                const done = i < loadingStep;
                const active = i === loadingStep;
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "12px 18px", borderRadius: 12,
                      background: active ? "var(--accent-dim)" : "var(--card)",
                      border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                      transition: "all 0.3s",
                      opacity: done || active ? 1 : 0.4,
                    }}
                  >
                    <div
                      style={{
                        width: 24, height: 24, borderRadius: "50%",
                        background: done ? "#22c55e" : active ? "var(--accent)" : "var(--border)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, color: "#fff", flexShrink: 0,
                        transition: "background 0.3s",
                      }}
                    >
                      {done ? "✓" : i + 1}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: active ? 600 : 400 }}>{step}</span>
                    {active && (
                      <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                        {[0, 1, 2].map((d) => (
                          <div
                            key={d}
                            style={{
                              width: 6, height: 6, borderRadius: "50%",
                              background: "var(--accent)",
                              animation: `bounce 1.2s ${d * 0.2}s infinite`,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <style>{`
              @keyframes bounce {
                0%,80%,100%{transform:translateY(0)}
                40%{transform:translateY(-6px)}
              }
            `}</style>
          </div>
        )}

        {/* Results page */}
        {results && !loading && (
          <div>
            {/* Summary banner */}
            <div
              style={{
                background: "var(--card)",
                borderRadius: 20,
                padding: "32px 36px",
                marginBottom: 32,
                boxShadow: "var(--shadow)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: 32,
                flexWrap: "wrap",
              }}
            >
              {overall !== null && (
                <div style={{ flexShrink: 0 }}>
                  <ScoreRing score={overall} maxScore={250} />
                  <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-dim)", marginTop: 6 }}>
                    Overall Score
                  </p>
                </div>
              )}
              <div style={{ flex: 1, minWidth: 200 }}>
                <h2 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 24, margin: "0 0 8px" }}>
                  Evaluation Complete
                </h2>
                <p style={{ color: "var(--text-dim)", margin: "0 0 16px", fontSize: 14 }}>
                  {answers.length} answer{answers.length !== 1 ? "s" : ""} evaluated
                </p>
                {overall !== null && (
                  <div
                    style={{
                      display: "inline-block",
                      padding: "6px 14px", borderRadius: 8,
                      background: "var(--accent-dim)",
                      color: "var(--accent)",
                      fontFamily: "Outfit, sans-serif", fontWeight: 600, fontSize: 14,
                    }}
                  >
                    {((overall / 250) * 100).toFixed(1)}% — {
                      overall >= 187 ? "Excellent" :
                      overall >= 125 ? "Good" : "Needs Improvement"
                    }
                  </div>
                )}
              </div>
            </div>

            {/* Answer tabs */}
            {answers.length > 1 && (
              <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                {answers.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedAnswer(i); setSelectedTab("scores"); }}
                    style={{
                      padding: "8px 18px", borderRadius: 10,
                      border: `1px solid ${selectedAnswer === i ? "var(--accent)" : "var(--border)"}`,
                      background: selectedAnswer === i ? "var(--accent-dim)" : "var(--card)",
                      color: selectedAnswer === i ? "var(--accent)" : "var(--text)",
                      fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 14,
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    Answer {i + 1}
                  </button>
                ))}
              </div>
            )}

            {/* Answer detail card */}
            {ans && (
              <div
                style={{
                  background: "var(--card)",
                  borderRadius: 20, border: "1px solid var(--border)",
                  boxShadow: "var(--shadow)",
                  overflow: "hidden",
                }}
              >
                {/* Score header */}
                <div
                  style={{
                    padding: "20px 28px",
                    borderBottom: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    flexWrap: "wrap", gap: 12,
                  }}
                >
                  <div>
                    <h3 style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 18, margin: "0 0 4px" }}>
                      Answer {selectedAnswer + 1}
                    </h3>
                    {ans.question && (
                      <p style={{ fontSize: 13, color: "var(--text-dim)", margin: 0, maxWidth: 500 }}>
                        {ans.question}
                      </p>
                    )}
                  </div>
                  {ans.scores?.total !== undefined && (
                    <div
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: 22, fontWeight: 700,
                        color: scoreColor((ans.scores.total / 100) * 100),
                      }}
                    >
                      {ans.scores.total}
                      <span style={{ fontSize: 14, color: "var(--text-dim)", fontWeight: 400 }}>/100</span>
                    </div>
                  )}
                </div>

                {/* Tab bar */}
                <div
                  style={{
                    display: "flex", borderBottom: "1px solid var(--border)",
                    padding: "0 28px",
                  }}
                >
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTab(t.id)}
                      style={{
                        padding: "14px 18px",
                        border: "none", background: "none",
                        fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 14,
                        cursor: "pointer",
                        color: selectedTab === t.id ? "var(--accent)" : "var(--text-dim)",
                        borderBottom: selectedTab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
                        marginBottom: -1, transition: "color 0.2s",
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div style={{ padding: "28px" }}>
                  {/* Scores tab */}
                  {selectedTab === "scores" && (
                    <div>
                      {ans.scores ? (
                        <div style={{ maxWidth: 520 }}>
                          {DIMENSIONS.map((d) =>
                            ans.scores[d.key] !== undefined ? (
                              <ScoreBar
                                key={d.key}
                                label={d.label}
                                value={ans.scores[d.key]}
                                max={20}
                              />
                            ) : null
                          )}
                        </div>
                      ) : (
                        <p style={{ color: "var(--text-dim)" }}>No score breakdown available.</p>
                      )}
                    </div>
                  )}

                  {/* Factual errors tab */}
                  {selectedTab === "errors" && (
                    <div>
                      {ans.factual_errors?.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                          {ans.factual_errors.map((e, i) => (
                            <div
                              key={i}
                              style={{
                                borderRadius: 12, overflow: "hidden",
                                border: "1px solid var(--border)",
                              }}
                            >
                              <div
                                style={{
                                  padding: "12px 16px",
                                  background: "rgba(239,68,68,0.1)",
                                  borderBottom: "1px solid var(--border)",
                                  display: "flex", gap: 10, alignItems: "flex-start",
                                }}
                              >
                                <span style={{ fontSize: 14, flexShrink: 0 }}>❌</span>
                                <div>
                                  <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.06em" }}>Error</p>
                                  <p style={{ margin: 0, fontSize: 14 }}>{e.error ?? e}</p>
                                </div>
                              </div>
                              {e.correction && (
                                <div
                                  style={{
                                    padding: "12px 16px",
                                    background: "rgba(34,197,94,0.08)",
                                    display: "flex", gap: 10, alignItems: "flex-start",
                                  }}
                                >
                                  <span style={{ fontSize: 14, flexShrink: 0 }}>✅</span>
                                  <div>
                                    <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.06em" }}>Correction</p>
                                    <p style={{ margin: 0, fontSize: 14 }}>{e.correction}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ textAlign: "center", padding: "32px 0" }}>
                          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                          <p style={{ color: "var(--text-dim)" }}>No factual errors detected.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Improvements tab */}
                  {selectedTab === "improvements" && (
                    <div>
                      {ans.improvements?.length > 0 ? (
                        <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                          {ans.improvements.map((tip, i) => (
                            <li
                              key={i}
                              style={{
                                display: "flex", gap: 14, alignItems: "flex-start",
                                padding: "14px 16px", borderRadius: 12,
                                background: "var(--card2)",
                                border: "1px solid var(--border)",
                              }}
                            >
                              <div
                                style={{
                                  width: 26, height: 26, borderRadius: "50%",
                                  background: "var(--accent-dim)", color: "var(--accent)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontFamily: "Outfit, sans-serif", fontWeight: 700, fontSize: 13,
                                  flexShrink: 0,
                                }}
                              >
                                {i + 1}
                              </div>
                              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{tip}</p>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p style={{ color: "var(--text-dim)" }}>No improvement suggestions available.</p>
                      )}
                    </div>
                  )}

                  {/* Extracted text tab */}
                  {selectedTab === "text" && (
                    <div>
                      {ans.extracted_text ? (
                        <pre
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                            fontSize: 13, lineHeight: 1.7,
                            whiteSpace: "pre-wrap", wordBreak: "break-word",
                            background: "var(--card2)",
                            borderRadius: 12, padding: 20,
                            border: "1px solid var(--border)",
                            margin: 0,
                            maxHeight: 400, overflowY: "auto",
                            color: "var(--text)",
                          }}
                        >
                          {ans.extracted_text}
                        </pre>
                      ) : (
                        <p style={{ color: "var(--text-dim)" }}>No extracted text available.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
