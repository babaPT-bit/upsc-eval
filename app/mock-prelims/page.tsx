"use client";
import { useState, useCallback } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import CountdownTimer from "../components/CountdownTimer";
import prelimsData from "../../content/mock-prelims-questions.json";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface Question {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  subject: string;
}

type Phase = "setup" | "test" | "results";

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const ALL_SUBJECTS = ["All", ...Array.from(new Set((prelimsData.questions as Question[]).map(q => q.subject))).sort()];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── Component ───────────────────────────────────────────────────────────── */
export default function MockPrelimsPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [timedOut, setTimedOut] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [timerKey, setTimerKey] = useState(0);

  const handleStart = () => {
    const pool = subjectFilter === "All"
      ? (prelimsData.questions as Question[])
      : (prelimsData.questions as Question[]).filter(q => q.subject === subjectFilter);
    const selected = shuffle(pool);
    const secs = selected.length * prelimsData.meta.default_time_per_question_seconds;
    setQuestions(selected);
    setAnswers(Object.fromEntries(selected.map(q => [q.id, null])));
    setCurrentIdx(0);
    setTimedOut(false);
    setTotalSeconds(secs);
    setTimerKey(k => k + 1);
    setPhase("test");
  };

  const handleExpire = useCallback(() => {
    setTimedOut(true);
    setPhase("results");
  }, []);

  const selectOption = (qId: string, idx: number) => {
    setAnswers(prev => ({ ...prev, [qId]: idx }));
  };

  const submit = () => setPhase("results");

  /* ── Results ─────────────────────────────────────────────────────────── */
  if (phase === "results") {
    const correct = questions.filter(q => answers[q.id] === q.correct).length;
    const pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const pctColor = pct >= 67 ? "var(--success)" : pct >= 40 ? "var(--warning)" : "var(--danger)";

    const bySubject: Record<string, { attempted: number; correct: number }> = {};
    questions.forEach(q => {
      if (!bySubject[q.subject]) bySubject[q.subject] = { attempted: 0, correct: 0 };
      if (answers[q.id] !== null) bySubject[q.subject].attempted++;
      if (answers[q.id] === q.correct) bySubject[q.subject].correct++;
    });

    return (
      <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
        <Nav />
        <div className="site-wrap" style={{ paddingTop: 48, paddingBottom: 96, maxWidth: 680 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-muted)", marginBottom: 8 }}>
            {timedOut ? "Time's up — " : ""}Results
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginBottom: 32, paddingBottom: 32, borderBottom: "1px solid var(--hairline)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 64, fontWeight: 700, lineHeight: 1, color: pctColor }}>{pct}%</span>
            <div style={{ paddingBottom: 8 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: "var(--ink-muted)" }}>{correct} / {questions.length}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)" }}>correct</div>
            </div>
          </div>

          {Object.keys(bySubject).length > 1 && (
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 14 }}>By subject</div>
              {Object.entries(bySubject).map(([subj, { attempted, correct: c }]) => {
                const sp = attempted > 0 ? Math.round((c / attempted) * 100) : 0;
                return (
                  <div key={subj} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: "var(--ink-muted)" }}>{subj}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)" }}>{c}/{attempted}</span>
                    </div>
                    <div style={{ height: 3, background: "var(--hairline)", borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${sp}%`, background: sp >= 67 ? "var(--success)" : sp >= 40 ? "var(--warning)" : "var(--danger)", borderRadius: 2, transition: "width 0.4s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ marginBottom: 40 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 16 }}>Full review</div>
            {questions.map((q, i) => {
              const chosen = answers[q.id];
              const isCorrect = chosen === q.correct;
              const isSkipped = chosen === null;
              return (
                <div key={q.id} style={{ paddingBottom: 28, marginBottom: 28, borderBottom: "1px solid var(--hairline)" }}>
                  <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center" }}>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--paper)",
                      background: isSkipped ? "var(--ink-faint)" : isCorrect ? "var(--success)" : "var(--danger)",
                      padding: "2px 8px", borderRadius: 2, flexShrink: 0,
                    }}>Q{i + 1}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)" }}>{q.subject}</span>
                  </div>
                  <p style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.65, marginBottom: 14, whiteSpace: "pre-line" }}>{q.question}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                    {q.options.map((opt, oi) => {
                      const isChosen = chosen === oi;
                      const isCorrectOpt = q.correct === oi;
                      let border = "var(--hairline)", bg = "transparent", textCol = "var(--ink-muted)";
                      if (isCorrectOpt) { border = "var(--success)"; bg = "color-mix(in srgb, var(--success) 12%, transparent)"; textCol = "var(--success)"; }
                      if (isChosen && !isCorrectOpt) { border = "var(--danger)"; bg = "color-mix(in srgb, var(--danger) 10%, transparent)"; textCol = "var(--danger)"; }
                      return (
                        <div key={oi} style={{ padding: "8px 12px", border: `1px solid ${border}`, borderRadius: 4, background: bg, fontSize: 13, color: textCol, display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, flexShrink: 0, marginTop: 1 }}>{String.fromCharCode(65 + oi)}.</span>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                  {isSkipped && <p style={{ fontSize: 12, color: "var(--ink-faint)", fontStyle: "italic", marginBottom: 8 }}>Not answered</p>}
                  <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 4, padding: "10px 14px" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 6 }}>Explanation</div>
                    <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.65 }}>{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={handleStart} style={{ padding: "10px 20px", borderRadius: 4, background: "var(--accent)", color: "var(--accent-ink)", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              Try again
            </button>
            <button onClick={() => setPhase("setup")} style={{ padding: "10px 20px", borderRadius: 4, border: "1px solid var(--hairline)", background: "transparent", color: "var(--ink-muted)", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
              Change subject
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── Test ────────────────────────────────────────────────────────────── */
  if (phase === "test" && questions.length > 0) {
    const q = questions[currentIdx];
    const chosen = answers[q.id];
    const isLast = currentIdx === questions.length - 1;
    const answered = Object.values(answers).filter(v => v !== null).length;

    return (
      <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
        <div style={{ position: "sticky", top: 52, zIndex: 40, background: "var(--paper)", borderBottom: "1px solid var(--hairline)" }}>
          <div className="site-wrap" style={{ display: "flex", alignItems: "center", gap: 16, height: 52 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-muted)", whiteSpace: "nowrap" }}>
              <strong style={{ color: "var(--ink)" }}>{currentIdx + 1}</strong> / {questions.length}
            </span>
            <div style={{ flex: 1, height: 2, background: "var(--hairline)", borderRadius: 1 }}>
              <div style={{ height: "100%", width: `${(currentIdx / questions.length) * 100}%`, background: "var(--accent)", borderRadius: 1, transition: "width 0.2s" }} />
            </div>
            <CountdownTimer key={timerKey} seconds={totalSeconds} onExpire={handleExpire} />
          </div>
        </div>

        <div className="site-wrap" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 640 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent)", marginBottom: 16 }}>{q.subject}</div>
          <p style={{ fontSize: 16, color: "var(--ink)", lineHeight: 1.7, marginBottom: 28, whiteSpace: "pre-line" }}>{q.question}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
            {q.options.map((opt, oi) => {
              const isSelected = chosen === oi;
              return (
                <button
                  key={oi}
                  onClick={() => selectOption(q.id, oi)}
                  style={{
                    padding: "12px 16px",
                    border: `1.5px solid ${isSelected ? "var(--accent)" : "var(--hairline)"}`,
                    borderRadius: 6,
                    background: isSelected ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "var(--surface)",
                    color: isSelected ? "var(--ink)" : "var(--ink-muted)",
                    fontSize: 14,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: isSelected ? "var(--accent)" : "var(--ink-faint)", flexShrink: 0, marginTop: 2 }}>{String.fromCharCode(65 + oi)}.</span>
                  <span style={{ lineHeight: 1.55 }}>{opt}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {currentIdx > 0 && (
              <button onClick={() => setCurrentIdx(i => i - 1)} style={{ padding: "9px 18px", borderRadius: 4, border: "1px solid var(--hairline)", background: "transparent", color: "var(--ink-muted)", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                ← Previous
              </button>
            )}
            {isLast ? (
              <button onClick={submit} style={{ padding: "9px 20px", borderRadius: 4, background: "var(--accent)", color: "var(--accent-ink)", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                Submit Test ({answered}/{questions.length} answered)
              </button>
            ) : (
              <button onClick={() => setCurrentIdx(i => i + 1)} style={{ padding: "9px 20px", borderRadius: 4, background: "var(--accent)", color: "var(--accent-ink)", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Setup ───────────────────────────────────────────────────────────── */
  const filtered = subjectFilter === "All"
    ? prelimsData.questions
    : (prelimsData.questions as Question[]).filter(q => q.subject === subjectFilter);

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
      <Nav />
      <div className="site-wrap" style={{ paddingTop: 64, paddingBottom: 96, maxWidth: 560 }}>
        <span className="eyebrow">Mock Prelims</span>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-3xl)", letterSpacing: "-0.02em", marginBottom: 8 }}>
          Timed MCQ practice
        </h1>
        <p style={{ color: "var(--ink-muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>
          Adapted from UPSC Prelims 2023/2024 PYQs and standard syllabus facts.
          One shared timer for the full set — mirrors real Prelims pacing.
        </p>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 0 }}>Filter by subject</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 0, borderBottom: "1px solid var(--hairline)" }}>
            {ALL_SUBJECTS.map(s => (
              <button
                key={s}
                onClick={() => setSubjectFilter(s)}
                style={{
                  padding: "10px 14px 11px",
                  border: "none",
                  borderBottom: `2px solid ${subjectFilter === s ? "var(--accent)" : "transparent"}`,
                  marginBottom: -1,
                  background: "transparent",
                  color: subjectFilter === s ? "var(--ink)" : "var(--ink-muted)",
                  fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                  fontWeight: subjectFilter === s ? 500 : 400,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 6, padding: "20px 24px", marginBottom: 28 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--ink)", marginBottom: 4 }}>
            {filtered.length} question{filtered.length !== 1 ? "s" : ""}
            {subjectFilter !== "All" ? ` — ${subjectFilter}` : " across all subjects"}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-muted)" }}>
            {Math.ceil(filtered.length * prelimsData.meta.default_time_per_question_seconds / 60)} min · {prelimsData.meta.default_time_per_question_seconds}s per question (shared clock)
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={filtered.length === 0}
          style={{ padding: "12px 28px", borderRadius: 4, background: filtered.length > 0 ? "var(--accent)" : "var(--hairline)", color: "var(--accent-ink)", fontSize: 15, fontWeight: 600, border: "none", cursor: filtered.length > 0 ? "pointer" : "not-allowed", fontFamily: "inherit" }}
        >
          Start Test →
        </button>
      </div>
      <Footer />
    </div>
  );
}
