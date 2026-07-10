"use client";
import { useState, useCallback } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import CountdownTimer from "../components/CountdownTimer";
import prelimsData from "../../content/mock-prelims-questions.json";

/* ── Types ──────────────────────────────────────────────────────────────── */
type OptionKey = "a" | "b" | "c" | "d";

interface PrelimsQuestion {
  id: string;
  question_text: string;
  options: Record<OptionKey, string>;
  correct_answer: OptionKey;
  explanation: string;
  subject: string;
  syllabus_topic: string;
  marks: number;
  difficulty: "easy" | "moderate" | "hard";
}

interface QuestionSet {
  id: string;
  label: string;
  paper: string;
  source: "pyq" | "mock" | "generated";
  questions: PrelimsQuestion[];
}

type Mode = "knowledge" | "mock";
type SourceFilter = "pyq" | "pyq+generated" | "mixed";
type Phase = "setup" | "answering" | "reviewed";

const ALL_SETS = prelimsData.question_sets as QuestionSet[];
const ALL_QUESTIONS: PrelimsQuestion[] = ALL_SETS.flatMap(s => s.questions);
const ALL_QUESTIONS_BY_SOURCE = new Map<string, QuestionSet["source"]>(
  ALL_SETS.flatMap(s => s.questions.map(q => [q.id, s.source] as const))
);

const SUBJECT_CHIPS = ["Polity", "Economy", "Geography", "History", "Environment", "Science & Technology", "Ethics"];
const QUESTION_COUNTS = [10, 25, 50] as const;
const SOURCE_FILTERS: { id: SourceFilter; label: string }[] = [
  { id: "pyq", label: "PYQ" },
  { id: "pyq+generated", label: "PYQ + generated" },
  { id: "mixed", label: "Mixed" },
];

// Real UPSC Prelims GS1 pacing: 200 marks / 100 questions in 120 minutes ≈ 72s/question.
const SECONDS_PER_QUESTION = 72;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sourceMatches(source: QuestionSet["source"], filter: SourceFilter): boolean {
  if (filter === "mixed") return true;
  if (filter === "pyq") return source === "pyq";
  return source === "pyq" || source === "generated"; // pyq+generated
}

// Same grading thresholds as EvalResultCard.tsx — do not diverge from this scheme.
const pctColor = (p: number) => p >= 75 ? "var(--success)" : p >= 50 ? "var(--warning)" : "var(--danger)";

/* ── Component ───────────────────────────────────────────────────────────── */
export default function MockPrelimsPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [mode, setMode] = useState<Mode>("knowledge");

  // Knowledge test config
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("mixed");

  // Session state (shared by both modes)
  const [questions, setQuestions] = useState<PrelimsQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, OptionKey | null>>({});
  const [timedOut, setTimedOut] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});

  const toggleSubject = (s: string) => {
    setSelectedSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const knowledgePool = selectedSubjects.length === 0
    ? []
    : ALL_QUESTIONS.filter(q =>
        selectedSubjects.includes(q.subject) &&
        sourceMatches(ALL_QUESTIONS_BY_SOURCE.get(q.id) ?? "pyq", sourceFilter)
      );

  const startKnowledgeTest = () => {
    const selected = shuffle(knowledgePool).slice(0, questionCount);
    setQuestions(selected);
    setAnswers(Object.fromEntries(selected.map(q => [q.id, null])));
    setCurrentIdx(0);
    setTimedOut(false);
    setExpandedExplanations({});
    setPhase("answering");
  };

  const startMockTest = (set: QuestionSet) => {
    const selected = shuffle(set.questions);
    setQuestions(selected);
    setAnswers(Object.fromEntries(selected.map(q => [q.id, null])));
    setCurrentIdx(0);
    setTimedOut(false);
    setTotalSeconds(selected.length * SECONDS_PER_QUESTION);
    setTimerKey(k => k + 1);
    setExpandedExplanations({});
    setPhase("answering");
  };

  const handleExpire = useCallback(() => {
    setTimedOut(true);
    setPhase("reviewed");
  }, []);

  const selectOption = (qId: string, key: OptionKey) => {
    setAnswers(prev => ({ ...prev, [qId]: key }));
  };

  const submit = () => setPhase("reviewed");

  const retrySameQuestions = () => {
    if (mode === "mock") {
      const asSet: QuestionSet = { id: "retry", label: "Retry", paper: "", source: "pyq", questions };
      startMockTest(asSet);
    } else {
      const selected = shuffle(questions);
      setQuestions(selected);
      setAnswers(Object.fromEntries(selected.map(q => [q.id, null])));
      setCurrentIdx(0);
      setTimedOut(false);
      setExpandedExplanations({});
      setPhase("answering");
    }
  };

  /* ── Setup ───────────────────────────────────────────────────────────── */
  if (phase === "setup") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
        <Nav />
        <div className="site-wrap" style={{ paddingTop: 64, paddingBottom: 96, maxWidth: 680 }}>
          <span className="eyebrow">Mock Prelims</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-3xl)", letterSpacing: "-0.02em", marginBottom: 8 }}>
            Timed MCQ practice
          </h1>
          <p style={{ color: "var(--ink-muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 40, maxWidth: 560 }}>
            Drill by subject at your own pace, or sit a full timed paper that mirrors real Prelims pacing.
          </p>

          {/* Mode cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
            <button
              onClick={() => setMode("knowledge")}
              style={{
                textAlign: "left", padding: "18px 18px 16px", borderRadius: 10,
                border: `1.5px solid ${mode === "knowledge" ? "var(--accent)" : "var(--hairline)"}`,
                background: mode === "knowledge" ? "var(--accent-bg)" : "var(--surface)",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--ink)", marginBottom: 4 }}>Knowledge test</div>
              <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5 }}>Untimed subject drill. Pick subjects, count, and source.</div>
            </button>
            <button
              onClick={() => setMode("mock")}
              style={{
                textAlign: "left", padding: "18px 18px 16px", borderRadius: 10,
                border: `1.5px solid ${mode === "mock" ? "var(--accent)" : "var(--hairline)"}`,
                background: mode === "mock" ? "var(--accent-bg)" : "var(--surface)",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--ink)", marginBottom: 4 }}>Mock test</div>
              <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5 }}>Timed full paper. One shared clock, mirrors real pacing.</div>
            </button>
          </div>

          {/* Knowledge test config */}
          {mode === "knowledge" && (
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 10 }}>
                Subjects
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
                {SUBJECT_CHIPS.map(s => {
                  const isSelected = selectedSubjects.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSubject(s)}
                      style={{
                        padding: "7px 14px", borderRadius: 20,
                        border: `1.5px solid ${isSelected ? "var(--accent)" : "var(--hairline)"}`,
                        background: isSelected ? "var(--accent-bg)" : "var(--surface)",
                        color: isSelected ? "var(--ink)" : "var(--ink-muted)",
                        fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 40, marginBottom: 28, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 10 }}>
                    Question count
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {QUESTION_COUNTS.map(c => (
                      <button
                        key={c}
                        onClick={() => setQuestionCount(c)}
                        style={{
                          padding: "7px 16px", borderRadius: 6,
                          border: `1.5px solid ${questionCount === c ? "var(--accent)" : "var(--hairline)"}`,
                          background: questionCount === c ? "var(--accent-bg)" : "var(--surface)",
                          color: questionCount === c ? "var(--ink)" : "var(--ink-muted)",
                          fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 10 }}>
                    Source
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {SOURCE_FILTERS.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setSourceFilter(f.id)}
                        style={{
                          padding: "7px 14px", borderRadius: 6,
                          border: `1.5px solid ${sourceFilter === f.id ? "var(--accent)" : "var(--hairline)"}`,
                          background: sourceFilter === f.id ? "var(--accent-bg)" : "var(--surface)",
                          color: sourceFilter === f.id ? "var(--ink)" : "var(--ink-muted)",
                          fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 6, padding: "16px 20px", marginBottom: 24 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-muted)" }}>
                  {selectedSubjects.length === 0
                    ? "Select at least one subject to see how many questions are available."
                    : `${knowledgePool.length} question${knowledgePool.length !== 1 ? "s" : ""} available — will use up to ${questionCount}.`}
                </div>
              </div>

              <button
                onClick={startKnowledgeTest}
                disabled={knowledgePool.length === 0}
                style={{
                  padding: "12px 28px", borderRadius: 4,
                  background: knowledgePool.length > 0 ? "var(--accent)" : "var(--hairline)",
                  color: "var(--accent-ink)", fontSize: 15, fontWeight: 600, border: "none",
                  cursor: knowledgePool.length > 0 ? "pointer" : "not-allowed", fontFamily: "inherit",
                }}
              >
                Start Knowledge Test →
              </button>
            </div>
          )}

          {/* Mock test — set picker, mirrors the set-picker UI in mock-mains/page.tsx */}
          {mode === "mock" && (
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 4 }}>
                Choose a paper
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {ALL_SETS.map(set => (
                  <button
                    key={set.id}
                    onClick={() => startMockTest(set)}
                    style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 0", border: "none", borderBottom: "1px solid var(--hairline)", background: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", gap: 16 }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 16, color: "var(--ink)" }}>{set.label}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", border: "1px solid var(--hairline)", borderRadius: 2, padding: "1px 6px", whiteSpace: "nowrap" }}>
                          {set.source}
                        </span>
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-muted)" }}>
                        {set.paper} · {set.questions.length} questions · ~{Math.ceil(set.questions.length * SECONDS_PER_QUESTION / 60)} min
                      </div>
                    </div>
                    <span style={{ color: "var(--ink-faint)", fontSize: 18, flexShrink: 0, paddingTop: 2 }}>→</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  /* ── Reviewed ────────────────────────────────────────────────────────── */
  if (phase === "reviewed") {
    const correct = questions.filter(q => answers[q.id] === q.correct_answer).length;
    const pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

    // Weakness map grouped by syllabus_topic (not just subject).
    // TODO: once a shared weakness store exists (fed by both Mains long-form
    // evaluation and Prelims MCQ results), write this per-topic
    // correct/attempted tally there instead of only computing it locally here.
    const byTopic: Record<string, { attempted: number; correct: number }> = {};
    questions.forEach(q => {
      if (!byTopic[q.syllabus_topic]) byTopic[q.syllabus_topic] = { attempted: 0, correct: 0 };
      if (answers[q.id] !== null) byTopic[q.syllabus_topic].attempted++;
      if (answers[q.id] === q.correct_answer) byTopic[q.syllabus_topic].correct++;
    });
    const topicRows = Object.entries(byTopic).map(([topic, { attempted, correct: c }]) => ({
      topic, attempted, correct: c,
      pct: attempted > 0 ? Math.round((c / attempted) * 100) : 0,
    })).sort((a, b) => a.pct - b.pct);

    return (
      <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
        <Nav />
        <div className="site-wrap" style={{ paddingTop: 56, paddingBottom: 96, maxWidth: 680 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-muted)", marginBottom: 8 }}>
            {timedOut ? "Time's up — " : ""}Session complete
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginBottom: 40, paddingBottom: 40, borderBottom: "1px solid var(--hairline)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 64, fontWeight: 700, lineHeight: 1, color: pctColor(pct) }}>{pct}%</span>
            <div style={{ paddingBottom: 8 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: "var(--ink-muted)" }}>{correct} / {questions.length}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)" }}>correct</div>
            </div>
          </div>

          {/* Weakness map */}
          {topicRows.length > 1 && (
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 14 }}>
                Weakness map — by syllabus topic
              </div>
              {topicRows.map(row => {
                const isGap = row.pct < 50;
                return (
                  <div key={row.topic} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--hairline)" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: "var(--ink)", marginBottom: 2 }}>{row.topic}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)" }}>{row.correct}/{row.attempted} correct</div>
                    </div>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                      color: isGap ? "var(--danger)" : "var(--success)",
                      background: isGap ? "var(--danger-bg)" : "var(--success-bg)",
                      whiteSpace: "nowrap",
                    }}>
                      {isGap ? "Content gap" : "On track"}
                    </span>
                    {isGap && (
                      <button
                        // Stub only — no revision content built yet.
                        onClick={() => {}}
                        style={{ padding: "6px 12px", borderRadius: 4, border: "1px solid var(--hairline)", background: "transparent", color: "var(--ink-muted)", fontSize: 12, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                      >
                        Revise topic
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, marginBottom: 16, color: "var(--ink)" }}>Full review</h2>
          {questions.map((q, i) => {
            const chosen = answers[q.id];
            const isCorrect = chosen === q.correct_answer;
            const isSkipped = chosen === null;
            const isExpanded = !!expandedExplanations[q.id];
            return (
              <div
                key={q.id}
                style={{
                  paddingLeft: 14, paddingBottom: 20, marginBottom: 20,
                  borderLeft: `3px solid ${isSkipped ? "var(--hairline)" : isCorrect ? "var(--success)" : "var(--danger)"}`,
                  borderBottom: "1px solid var(--hairline)",
                }}
              >
                <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)" }}>Q{i + 1}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)" }}>{q.syllabus_topic}</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.65, marginBottom: 12, whiteSpace: "pre-line" }}>{q.question_text}</p>

                <div style={{ display: "flex", gap: 24, marginBottom: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 2 }}>Your answer</div>
                    <div style={{ fontSize: 13, color: isSkipped ? "var(--ink-faint)" : isCorrect ? "var(--success)" : "var(--danger)" }}>
                      {isSkipped ? "Not answered" : `${chosen!.toUpperCase()}. ${q.options[chosen!]}`}
                    </div>
                  </div>
                  {!isCorrect && (
                    <div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 2 }}>Correct answer</div>
                      <div style={{ fontSize: 13, color: "var(--success)" }}>{q.correct_answer.toUpperCase()}. {q.options[q.correct_answer]}</div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setExpandedExplanations(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                  style={{ background: "none", border: "none", padding: 0, fontSize: 12, color: "var(--accent)", cursor: "pointer", fontFamily: "inherit" }}
                >
                  {isExpanded ? "Hide explanation ▲" : "Show explanation ▼"}
                </button>
                {isExpanded && (
                  <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 4, padding: "10px 14px", marginTop: 10 }}>
                    <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.65 }}>{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}

          <div style={{ display: "flex", gap: 12, marginTop: 36 }}>
            <button onClick={retrySameQuestions} style={{ padding: "10px 20px", borderRadius: 4, background: "var(--accent)", color: "var(--accent-ink)", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              Try again
            </button>
            <button onClick={() => setPhase("setup")} style={{ padding: "10px 20px", borderRadius: 4, border: "1px solid var(--hairline)", background: "transparent", color: "var(--ink-muted)", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
              Change setup
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── Answering ───────────────────────────────────────────────────────── */
  if (questions.length === 0) return null;
  const q = questions[currentIdx];
  const chosen = answers[q.id];
  const isLast = currentIdx === questions.length - 1;
  const answered = Object.values(answers).filter(v => v !== null).length;
  const optionKeys: OptionKey[] = ["a", "b", "c", "d"];

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
      {/* Sticky top bar — sits below the global Nav (52px), same convention as mock-mains */}
      <div style={{ position: "sticky", top: 52, zIndex: 40, background: "var(--paper)", borderBottom: "1px solid var(--hairline)" }}>
        <div className="site-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, height: 52 }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-muted)",
            border: "1px solid var(--hairline)", borderRadius: 20, padding: "4px 12px",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {q.subject} · {q.syllabus_topic}
          </span>
          {mode === "mock" ? (
            <CountdownTimer key={timerKey} seconds={totalSeconds} onExpire={handleExpire} />
          ) : (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-muted)", whiteSpace: "nowrap" }}>
              <strong style={{ color: "var(--ink)" }}>{currentIdx + 1}</strong> / {questions.length}
            </span>
          )}
        </div>
      </div>

      <div className="site-wrap" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 640 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 10, padding: "24px 24px 8px", marginBottom: 24 }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 16, color: "var(--ink)", lineHeight: 1.7, marginBottom: 24, whiteSpace: "pre-line" }}>
            {q.question_text}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {optionKeys.map(key => {
              const isSelected = chosen === key;
              return (
                <button
                  key={key}
                  onClick={() => selectOption(q.id, key)}
                  style={{
                    padding: "12px 16px",
                    border: `1.5px solid ${isSelected ? "var(--accent)" : "var(--hairline)"}`,
                    borderRadius: 6,
                    background: isSelected ? "var(--accent-bg)" : "var(--surface)",
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
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: isSelected ? "var(--accent)" : "var(--ink-faint)", flexShrink: 0, marginTop: 2 }}>
                    {key.toUpperCase()}.
                  </span>
                  <span style={{ lineHeight: 1.55 }}>{q.options[key]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thin progress bar */}
        <div style={{ height: 3, background: "var(--hairline)", borderRadius: 2, marginBottom: 20 }}>
          <div style={{ height: "100%", width: `${(currentIdx / questions.length) * 100}%`, background: "var(--accent)", borderRadius: 2, transition: "width 0.2s" }} />
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
