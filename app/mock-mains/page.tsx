"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import Nav from "../components/Nav";
import CountdownTimer from "../components/CountdownTimer";
import AnswerEditor, { AnswerMode } from "../components/AnswerEditor";
import EvalResultCard, { mapToEvalResult, EvalResultData } from "../components/EvalResultCard";
import mainsData from "../../content/mock-mains-questions.json";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface MainsQuestion {
  id: string;
  question: string;
  marks: number;
  time_minutes: number;
  word_limit: number;
  topic: string;
}

interface QuestionSet {
  id: string;
  label: string;
  paper: string;
  source: string;
  questions: MainsQuestion[];
}

interface SessionEntry {
  question: MainsQuestion;
  result: EvalResultData;
}

type Phase = "setup" | "answering" | "evaluating" | "reviewed" | "done";

/* ── Component ───────────────────────────────────────────────────────────── */
export default function MockMainsPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [selectedSet, setSelectedSet] = useState<QuestionSet | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [mode, setMode] = useState<AnswerMode>("type");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sessionResults, setSessionResults] = useState<SessionEntry[]>([]);
  const [currentResult, setCurrentResult] = useState<EvalResultData | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [timerKey, setTimerKey] = useState(0);
  const [timerExpired, setTimerExpired] = useState(false);

  const currentQ = selectedSet?.questions[currentIdx] ?? null;

  const startSession = (set: QuestionSet) => {
    setSelectedSet(set);
    setCurrentIdx(0);
    setSessionResults([]);
    setTypedAnswer("");
    setFile(null);
    setMode("type");
    setCurrentResult(null);
    setEvalError(null);
    setTimerExpired(false);
    setTimerKey(k => k + 1);
    setPhase("answering");
  };

  const handleTimerExpire = useCallback(() => setTimerExpired(true), []);

  const submitAnswer = async () => {
    if (!currentQ || !selectedSet) return;
    setPhase("evaluating");
    setEvalError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any;
      if (mode === "upload" && file) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("https://PranshuT-upsc-answer-evaluator.hf.space/evaluate", { method: "POST", body: form });
        if (!res.ok) throw new Error(`${res.status}`);
        data = await res.json();
      } else {
        const res = await fetch("https://PranshuT-upsc-answer-evaluator.hf.space/evaluate-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: typedAnswer, question: currentQ.question }),
        });
        if (!res.ok) throw new Error(`${res.status}`);
        data = await res.json();
      }
      const result = mapToEvalResult(data, currentQ.marks);
      setCurrentResult(result);
      setSessionResults(prev => [...prev, { question: currentQ, result }]);
      setPhase("reviewed");
    } catch {
      setEvalError("Our servers are at capacity right now. Please try again in a few minutes.");
      setPhase("answering");
    }
  };

  const nextQuestion = () => {
    if (!selectedSet) return;
    if (currentIdx < selectedSet.questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setTypedAnswer("");
      setFile(null);
      setMode("type");
      setCurrentResult(null);
      setTimerExpired(false);
      setTimerKey(k => k + 1);
      setPhase("answering");
    } else {
      setPhase("done");
    }
  };

  const avgScore = sessionResults.length > 0
    ? Math.round(sessionResults.reduce((s, e) => s + e.result.percentage, 0) / sessionResults.length)
    : null;

  const pctColor = (p: number) => p >= 75 ? "var(--success)" : p >= 50 ? "var(--warning)" : "var(--danger)";

  /* ── Setup ───────────────────────────────────────────────────────────── */
  if (phase === "setup") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
        <Nav />
        <div className="site-wrap" style={{ paddingTop: 64, paddingBottom: 96 }}>
          <Link href="/" style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-muted)", textDecoration: "none", display: "inline-block", marginBottom: 40 }}>← Back to Abhyaas AI</Link>

          <span className="eyebrow">Mock Mains</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-3xl)", letterSpacing: "-0.02em", marginBottom: 8 }}>
            Sequential mains practice
          </h1>
          <p style={{ color: "var(--ink-muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 48, maxWidth: 520 }}>
            Answer question by question with a per-question timer. Get evaluated after each.
            GS3 2024 set uses questions from the official paper; other sets are labeled as practice questions.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {(mainsData.question_sets as QuestionSet[]).map(set => {
              const isPYQ = set.source.startsWith("PYQ-style");
              return (
                <button
                  key={set.id}
                  onClick={() => startSession(set)}
                  style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 0", border: "none", borderBottom: "1px solid var(--hairline)", background: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", gap: 16 }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 16, color: "var(--ink)" }}>{set.label}</span>
                      {isPYQ && (
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", border: "1px solid var(--hairline)", borderRadius: 2, padding: "1px 6px", whiteSpace: "nowrap" }}>Practice</span>
                      )}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-muted)" }}>
                      {set.paper} · {set.questions.length} questions
                    </div>
                  </div>
                  <span style={{ color: "var(--ink-faint)", fontSize: 18, flexShrink: 0, paddingTop: 2 }}>→</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ── Done ────────────────────────────────────────────────────────────── */
  if (phase === "done" && selectedSet) {
    const dimTotals: Record<string, { total: number; count: number }> = {};
    sessionResults.forEach(e => e.result.dimensions.forEach(d => {
      if (!dimTotals[d.name]) dimTotals[d.name] = { total: 0, count: 0 };
      dimTotals[d.name].total += d.score / d.max;
      dimTotals[d.name].count++;
    }));
    let weakestDim = "", weakestAvg = 1;
    Object.entries(dimTotals).forEach(([name, { total, count }]) => {
      const avg = total / count;
      if (avg < weakestAvg) { weakestAvg = avg; weakestDim = name; }
    });

    return (
      <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
        <Nav />
        <div className="site-wrap" style={{ paddingTop: 56, paddingBottom: 96, maxWidth: 680 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-muted)", marginBottom: 8 }}>Session complete</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-2xl)", letterSpacing: "-0.02em", marginBottom: 28 }}>{selectedSet.label}</h1>

          <div style={{ display: "flex", gap: 40, marginBottom: 40, paddingBottom: 40, borderBottom: "1px solid var(--hairline)", flexWrap: "wrap" }}>
            {[
              ["Average score", avgScore !== null ? `${avgScore}%` : "—"],
              ["Questions", `${sessionResults.length}/${selectedSet.questions.length}`],
              ...(weakestDim ? [["Weakest dimension", weakestDim]] : []),
            ].map(([label, val]) => (
              <div key={String(label)}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 500, color: "var(--ink)", marginBottom: 2 }}>{val}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)" }}>{label}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, marginBottom: 16, color: "var(--ink)" }}>Per-question results</h2>
          {sessionResults.map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "16px 0", borderBottom: "1px solid var(--hairline)" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)", minWidth: 24, paddingTop: 2 }}>Q{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5, marginBottom: 2 }}>{e.question.question.slice(0, 90)}{e.question.question.length > 90 ? "…" : ""}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)" }}>{e.question.topic}</div>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: pctColor(e.result.percentage), flexShrink: 0 }}>{e.result.percentage}%</span>
            </div>
          ))}

          <div style={{ display: "flex", gap: 12, marginTop: 36 }}>
            <button onClick={() => startSession(selectedSet)} style={{ padding: "10px 20px", borderRadius: 4, background: "var(--accent)", color: "var(--accent-ink)", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              New Session
            </button>
            <button onClick={() => setPhase("setup")} style={{ padding: "10px 20px", borderRadius: 4, border: "1px solid var(--hairline)", background: "transparent", color: "var(--ink-muted)", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
              Change Set
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Question screen ─────────────────────────────────────────────────── */
  if (!currentQ || !selectedSet) return null;
  const isLast = currentIdx === selectedSet.questions.length - 1;
  const canSubmit = mode === "type" ? typedAnswer.trim().length > 30 : !!file;

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
      {/* Sticky progress header */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--paper)", borderBottom: "1px solid var(--hairline)" }}>
        <div className="site-wrap" style={{ display: "flex", alignItems: "center", gap: 16, height: 52 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-muted)", whiteSpace: "nowrap" }}>
            <strong style={{ color: "var(--ink)" }}>{currentIdx + 1}</strong> / {selectedSet.questions.length}
          </span>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selectedSet.paper}</div>
          <CountdownTimer key={timerKey} seconds={currentQ.time_minutes * 60} onExpire={handleTimerExpire} />
          {avgScore !== null && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-muted)", whiteSpace: "nowrap" }}>
              Avg: <span style={{ color: pctColor(avgScore) }}>{avgScore}%</span>
            </span>
          )}
        </div>
      </div>

      <div className="site-wrap" style={{ paddingTop: 48, paddingBottom: 80, maxWidth: 680 }}>
        {/* Question meta */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{currentQ.topic}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)" }}>·</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)" }}>{currentQ.marks} marks</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)" }}>·</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)" }}>~{currentQ.word_limit} words</span>
        </div>

        <p style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 500, color: "var(--ink)", lineHeight: 1.55, marginBottom: 32 }}>{currentQ.question}</p>

        {/* Timer expired banner */}
        {timerExpired && phase === "answering" && (
          <div style={{ border: "1px solid var(--warning)", borderRadius: 6, padding: "10px 16px", marginBottom: 20, fontSize: 13, color: "var(--warning)", background: "color-mix(in srgb, var(--warning) 8%, transparent)" }}>
            Time&apos;s up for this question — finish writing or submit when ready.
          </div>
        )}

        {/* Error */}
        {evalError && phase === "answering" && (
          <div style={{ border: "1px solid var(--danger)", borderRadius: 6, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "var(--ink-muted)", background: "color-mix(in srgb, var(--danger) 6%, transparent)" }}>
            {evalError}
          </div>
        )}

        {phase === "evaluating" && (
          <div style={{ padding: "48px 0", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-muted)", marginBottom: 8 }}>Evaluating your answer…</div>
            <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>Typically 30–90 seconds.</div>
          </div>
        )}

        {phase === "answering" && (
          <>
            <AnswerEditor
              mode={mode}
              onModeChange={setMode}
              typedValue={typedAnswer}
              onTypedChange={setTypedAnswer}
              file={file}
              onFileChange={setFile}
              placeholder={`Write your answer here (aim for ~${currentQ.word_limit} words)…`}
              minHeight={240}
            />
            <div style={{ marginTop: 20 }}>
              <button
                onClick={submitAnswer}
                disabled={!canSubmit}
                style={{ padding: "10px 24px", borderRadius: 4, background: canSubmit ? "var(--accent)" : "var(--hairline)", color: canSubmit ? "var(--accent-ink)" : "var(--ink-faint)", fontSize: 14, fontWeight: 600, border: "none", cursor: canSubmit ? "pointer" : "not-allowed", fontFamily: "inherit" }}
              >
                Evaluate →
              </button>
            </div>
          </>
        )}

        {phase === "reviewed" && currentResult && (
          <>
            <EvalResultCard result={currentResult} />
            <div style={{ marginTop: 24 }}>
              <button
                onClick={nextQuestion}
                style={{ padding: "10px 24px", borderRadius: 4, background: "var(--accent)", color: "var(--accent-ink)", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}
              >
                {isLast ? "See Session Summary →" : "Next Question →"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
