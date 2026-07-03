"use client";
import { useState, useRef } from "react";
import Nav from "../components/Nav";

interface MainsQuestion { q: string; marks: number; }
interface QuestionSet { id: string; label: string; paper: string; questions: MainsQuestion[]; }

const SETS: QuestionSet[] = [
  {
    id: "gs1-mixed", label: "GS1 — History & Society", paper: "GS Paper I",
    questions: [
      { q: "Discuss the significance of the Indian Ocean in India's foreign policy and security strategy. (15 marks)", marks: 15 },
      { q: "Analyze the causes and consequences of the partition of India in 1947. How has it shaped India's foreign policy? (15 marks)", marks: 15 },
      { q: "Critically examine the role of women in India's freedom struggle with specific examples. (10 marks)", marks: 10 },
    ],
  },
  {
    id: "gs2-polity", label: "GS2 — Polity & Governance", paper: "GS Paper II",
    questions: [
      { q: "Discuss the role and constitutional position of the Governor in India. Has the office become a 'constitutional relic'? (15 marks)", marks: 15 },
      { q: "Critically examine the independence of the judiciary in India with reference to recent developments. (15 marks)", marks: 15 },
      { q: "What is cooperative federalism? Examine its manifestation in India's response to recent crises. (10 marks)", marks: 10 },
    ],
  },
  {
    id: "gs3-economy", label: "GS3 — Economy & Environment", paper: "GS Paper III",
    questions: [
      { q: "Examine the challenges and opportunities for India in transitioning to a green economy. (15 marks)", marks: 15 },
      { q: "Critically analyze the performance of India's agricultural sector over the past decade. (15 marks)", marks: 15 },
      { q: "What is direct benefit transfer? Evaluate its impact on social welfare delivery in India. (10 marks)", marks: 10 },
    ],
  },
];

interface EvalResult { percentage: number; overallScore: number; maxScore: number; examinerVerdict: string; dimensions: { name: string; score: number; max: number }[]; }
interface SessionEntry { question: MainsQuestion; result: EvalResult; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseResult(data: any, maxScore: number): EvalResult {
  const eval_ = data?.evaluation || data;
  const dims = (eval_?.dimension_scores || []).map((d: any) => ({
    name: d.dimension || d.name || "",
    score: d.score ?? 0,
    max: d.max_score ?? 10,
  }));
  const total = dims.reduce((sum: number, d: any) => sum + d.score, 0);
  const maxTotal = dims.reduce((sum: number, d: any) => sum + d.max, 0) || maxScore;
  const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
  return {
    percentage: eval_?.percentage ?? pct,
    overallScore: eval_?.overall_score ?? total,
    maxScore: eval_?.max_score ?? maxScore,
    examinerVerdict: eval_?.examiner_verdict ?? eval_?.verdict ?? "",
    dimensions: dims,
  };
}

type Phase = "select" | "answering" | "evaluating" | "reviewed" | "done";

export default function MockMainsPage() {
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedSet, setSelectedSet] = useState<QuestionSet | null>(null);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answerMode, setAnswerMode] = useState<"type" | "upload">("type");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sessionResults, setSessionResults] = useState<SessionEntry[]>([]);
  const [currentResult, setCurrentResult] = useState<EvalResult | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentQ = selectedSet?.questions[currentQIdx] ?? null;
  const avgScore = sessionResults.length > 0
    ? Math.round(sessionResults.reduce((s, e) => s + e.result.percentage, 0) / sessionResults.length)
    : null;

  const startSession = (set: QuestionSet) => {
    setSelectedSet(set);
    setCurrentQIdx(0);
    setSessionResults([]);
    setTypedAnswer("");
    setUploadedFile(null);
    setCurrentResult(null);
    setEvalError(null);
    setPhase("answering");
  };

  const submitAnswer = async () => {
    if (!currentQ || !selectedSet) return;
    setPhase("evaluating");
    setEvalError(null);
    try {
      let data;
      if (answerMode === "upload" && uploadedFile) {
        const form = new FormData();
        form.append("file", uploadedFile);
        const res = await fetch("https://PranshuT-upsc-answer-evaluator.hf.space/evaluate", { method: "POST", body: form });
        if (!res.ok) throw new Error(`${res.status}`);
        data = await res.json();
      } else {
        const res = await fetch("https://PranshuT-upsc-answer-evaluator.hf.space/evaluate-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: typedAnswer, question: currentQ.q }),
        });
        if (!res.ok) throw new Error(`${res.status}`);
        data = await res.json();
      }
      const result = parseResult(data, currentQ.marks);
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
    if (currentQIdx < selectedSet.questions.length - 1) {
      setCurrentQIdx(i => i + 1);
      setTypedAnswer("");
      setUploadedFile(null);
      setCurrentResult(null);
      setPhase("answering");
    } else {
      setPhase("done");
    }
  };

  const pctColor = (p: number) => p >= 75 ? "var(--success)" : p >= 50 ? "var(--warning)" : "var(--danger)";

  /* ── SELECT ──────────────────────────────────────────────────────────── */
  if (phase === "select") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
        <Nav />
        <div className="site-wrap" style={{ paddingTop: 64, paddingBottom: 96 }}>
          <span className="eyebrow">Mock Mains</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-3xl)", letterSpacing: "-0.02em", marginBottom: 12 }}>
            Sequential mains practice
          </h1>
          <p style={{ color: "var(--ink-muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 48, maxWidth: 520 }}>
            Answer question by question. Get evaluated after each. Build a session score.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {SETS.map(set => (
              <button
                key={set.id}
                onClick={() => startSession(set)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0", border: "none", borderBottom: "1px solid var(--hairline)", background: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
              >
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 16, color: "var(--ink)", marginBottom: 4 }}>{set.label}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-muted)" }}>{set.paper} · {set.questions.length} questions</div>
                </div>
                <span style={{ color: "var(--ink-faint)", fontSize: 18 }}>→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── DONE ─────────────────────────────────────────────────────────────── */
  if (phase === "done" && selectedSet) {
    const weakest = (() => {
      const dimTotals: Record<string, { total: number; count: number }> = {};
      sessionResults.forEach(e => e.result.dimensions.forEach(d => {
        if (!dimTotals[d.name]) dimTotals[d.name] = { total: 0, count: 0 };
        dimTotals[d.name].total += d.score / d.max;
        dimTotals[d.name].count += 1;
      }));
      let weakName = "", weakAvg = 1;
      Object.entries(dimTotals).forEach(([name, { total, count }]) => {
        const avg = total / count;
        if (avg < weakAvg) { weakAvg = avg; weakName = name; }
      });
      return weakName;
    })();

    return (
      <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
        <Nav />
        <div className="site-wrap" style={{ paddingTop: 56, paddingBottom: 96, maxWidth: 680 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-muted)", marginBottom: 8 }}>Session complete</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-2xl)", letterSpacing: "-0.02em", marginBottom: 24 }}>
            {selectedSet.label}
          </h1>
          <div style={{ display: "flex", gap: 32, marginBottom: 40, paddingBottom: 40, borderBottom: "1px solid var(--hairline)" }}>
            {[["Average score", `${avgScore ?? 0}%`], ["Questions", `${sessionResults.length}/${selectedSet.questions.length}`], ...(weakest ? [["Weakest dimension", weakest]] : [])].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 500, color: "var(--ink)", marginBottom: 2 }}>{val}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)" }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, marginBottom: 16, color: "var(--ink)" }}>Per-question results</h2>
            {sessionResults.map((e, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderBottom: "1px solid var(--hairline)" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-faint)", minWidth: 24 }}>Q{i + 1}</span>
                <span style={{ flex: 1, fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5 }}>{e.question.q.slice(0, 80)}…</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: pctColor(e.result.percentage), flexShrink: 0 }}>{e.result.percentage}%</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => startSession(selectedSet)} style={{ padding: "10px 20px", borderRadius: 4, background: "var(--accent)", color: "var(--accent-ink)", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              New Session
            </button>
            <button onClick={() => setPhase("select")} style={{ padding: "10px 20px", borderRadius: 4, border: "1px solid var(--hairline)", background: "transparent", color: "var(--ink-muted)", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
              Change Set
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── ANSWERING / EVALUATING / REVIEWED ───────────────────────────────── */
  if (!currentQ || !selectedSet) return null;
  const isLast = currentQIdx === selectedSet.questions.length - 1;
  const canSubmit = answerMode === "type" ? typedAnswer.trim().length > 30 : !!uploadedFile;

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
      {/* Progress header */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--paper)", borderBottom: "1px solid var(--hairline)" }}>
        <div className="site-wrap" style={{ display: "flex", alignItems: "center", gap: 16, height: 52 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-muted)", whiteSpace: "nowrap" }}>
            Question <strong style={{ color: "var(--ink)" }}>{currentQIdx + 1}</strong> / {selectedSet.questions.length}
          </span>
          <div style={{ flex: 1, height: 2, background: "var(--hairline)", borderRadius: 1 }}>
            <div style={{ height: "100%", width: `${((currentQIdx) / selectedSet.questions.length) * 100}%`, background: "var(--accent)", borderRadius: 1, transition: "width 0.3s" }} />
          </div>
          {avgScore !== null && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-muted)", whiteSpace: "nowrap" }}>
              Avg: <span style={{ color: pctColor(avgScore) }}>{avgScore}%</span>
            </span>
          )}
        </div>
      </div>

      <div className="site-wrap" style={{ paddingTop: 48, paddingBottom: 80, maxWidth: 680 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-muted)", marginBottom: 12 }}>{selectedSet.paper}</div>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "var(--ink)", lineHeight: 1.5, marginBottom: 32 }}>{currentQ.q}</p>

        {phase === "evaluating" && (
          <div style={{ padding: "32px 0", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-muted)", marginBottom: 8 }}>Evaluating your answer…</div>
            <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>This typically takes 30–90 seconds.</div>
          </div>
        )}

        {phase === "answering" && (
          <>
            {evalError && (
              <div style={{ border: "1px solid var(--danger)", borderRadius: 6, background: "var(--danger-bg)", padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "var(--ink-muted)" }}>
                {evalError}
              </div>
            )}

            {/* Mode toggle */}
            <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
              {(["type", "upload"] as const).map(m => (
                <button key={m} onClick={() => setAnswerMode(m)} style={{ padding: "6px 16px", borderRadius: 4, border: `1px solid ${answerMode === m ? "var(--accent)" : "var(--hairline)"}`, background: answerMode === m ? "var(--accent-bg)" : "transparent", color: answerMode === m ? "var(--accent)" : "var(--ink-muted)", fontSize: 13, fontFamily: "inherit", cursor: "pointer", fontWeight: answerMode === m ? 500 : 400 }}>
                  {m === "type" ? "Type answer" : "Upload PDF"}
                </button>
              ))}
            </div>

            {answerMode === "type" ? (
              <textarea
                value={typedAnswer}
                onChange={e => setTypedAnswer(e.target.value)}
                placeholder="Write your answer here…"
                style={{ width: "100%", minHeight: 220, padding: "14px 16px", border: "1px solid var(--hairline)", borderRadius: 6, background: "var(--surface)", color: "var(--ink)", fontSize: 14, fontFamily: "inherit", lineHeight: 1.75, resize: "vertical", outline: "none", marginBottom: 20 }}
              />
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ border: "2px dashed var(--hairline)", borderRadius: 6, padding: "40px 24px", textAlign: "center", cursor: "pointer", marginBottom: 20 }}
              >
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: uploadedFile ? "var(--ink)" : "var(--ink-faint)" }}>
                  {uploadedFile ? uploadedFile.name : "Click to upload PDF answer sheet"}
                </div>
                <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => setUploadedFile(e.target.files?.[0] || null)} />
              </div>
            )}

            <button
              onClick={submitAnswer}
              disabled={!canSubmit}
              style={{ padding: "10px 24px", borderRadius: 4, background: canSubmit ? "var(--accent)" : "var(--hairline)", color: canSubmit ? "var(--accent-ink)" : "var(--ink-faint)", fontSize: 14, fontWeight: 600, border: "none", cursor: canSubmit ? "pointer" : "not-allowed", fontFamily: "inherit" }}
            >
              Evaluate →
            </button>
          </>
        )}

        {phase === "reviewed" && currentResult && (
          <>
            {/* Inline result */}
            <div style={{ border: "1px solid var(--hairline)", borderRadius: 6, background: "var(--surface)", overflow: "hidden", marginBottom: 28 }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, color: pctColor(currentResult.percentage), lineHeight: 1 }}>{currentResult.percentage}%</span>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--ink-muted)" }}>{currentResult.overallScore} / {currentResult.maxScore}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Score</div>
                </div>
              </div>
              {currentResult.examinerVerdict && (
                <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--hairline)" }}>
                  <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.7, fontStyle: "italic" }}>&ldquo;{currentResult.examinerVerdict}&rdquo;</p>
                </div>
              )}
              {currentResult.dimensions.length > 0 && (
                <div style={{ padding: "16px 24px" }}>
                  {currentResult.dimensions.slice(0, 4).map(d => (
                    <div key={d.name} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>{d.name}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)" }}>{d.score}/{d.max}</span>
                      </div>
                      <div style={{ height: 3, background: "var(--hairline)", borderRadius: 2 }}>
                        <div style={{ height: "100%", width: `${(d.score / d.max) * 100}%`, background: pctColor(Math.round((d.score / d.max) * 100)), borderRadius: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={nextQuestion}
              style={{ padding: "10px 24px", borderRadius: 4, background: "var(--accent)", color: "var(--accent-ink)", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              {isLast ? "See Session Summary" : "Next Question →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
