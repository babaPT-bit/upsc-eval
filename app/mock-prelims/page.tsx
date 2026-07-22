"use client";
import { useState, useMemo } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import CountdownTimer from "../components/CountdownTimer";
import prelimsData from "../../content/mock-prelims-questions.json";

/* ── Types ──────────────────────────────────────────────────────────────── */
type OptionKey = "a" | "b" | "c" | "d";

interface PrelimsQuestion {
  question_id: string;
  question_text: string;
  options: { a: string; b: string; c: string; d: string };
  correct_answer: OptionKey | null;
  explanation: string | null;
  paper: string;
  subject: string;
  syllabus_topic: string;
  source_type: "pyq" | "mock" | "generated";
  source_detail: string;
  marks: number | null;
  difficulty: string | null;
  answer_verified: boolean;
}

interface PrelimsSet {
  id: string;
  label: string;
  paper: string;
  source: string;
  questions: PrelimsQuestion[];
}

type Mode = "knowledge" | "mock";
type Phase = "setup" | "answering" | "reviewed";
type SourceFilter = "pyq" | "compiled" | "mix";

const SETS = (prelimsData as { question_sets: PrelimsSet[] }).question_sets;
const ALL_QUESTIONS: PrelimsQuestion[] = SETS.flatMap(s => s.questions);
const ALL_SUBJECTS = Array.from(new Set(ALL_QUESTIONS.map(q => q.subject))).sort();

const MOCK_DURATION_MINUTES = 120; // matches the printed "Time Allowed: Two Hours" on the source booklets

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
  const [mode, setMode] = useState<Mode>("knowledge");

  // Setup — knowledge test controls
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<10 | 25 | 50>(10);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("compiled");

  // Setup — mock test controls
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);

  // Active session
  const [activeQuestions, setActiveQuestions] = useState<PrelimsQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, OptionKey>>({});
  const [timerKey, setTimerKey] = useState(0);
  const [timerExpired, setTimerExpired] = useState(false);

  // Reviewed — weakness map accordion
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  const toggleSubjectChip = (subj: string) => {
    setSelectedSubjects(prev => prev.includes(subj) ? prev.filter(s => s !== subj) : [...prev, subj]);
  };

  const startKnowledgeTest = () => {
    const pool = ALL_QUESTIONS.filter(q => {
      const subjectOk = selectedSubjects.length === 0 || selectedSubjects.includes(q.subject);
      const sourceOk =
        sourceFilter === "mix" ? true :
        sourceFilter === "pyq" ? q.source_type === "pyq" :
        q.source_type === "mock" || q.source_type === "generated";
      return subjectOk && sourceOk;
    });
    const picked = shuffle(pool).slice(0, questionCount);
    beginSession(picked);
  };

  const startMockTest = () => {
    const set = SETS.find(s => s.id === selectedSetId);
    if (!set) return;
    beginSession(set.questions);
  };

  const beginSession = (questions: PrelimsQuestion[]) => {
    setActiveQuestions(questions);
    setCurrentIdx(0);
    setAnswers({});
    setTimerExpired(false);
    setTimerKey(k => k + 1);
    setExpandedSubject(null);
    setPhase("answering");
  };

  const currentQ = activeQuestions[currentIdx] ?? null;
  const isLast = currentIdx === activeQuestions.length - 1;

  const selectOption = (choice: OptionKey) => {
    if (!currentQ) return;
    setAnswers(prev => ({ ...prev, [currentQ.question_id]: choice }));
  };

  const goNext = () => {
    if (isLast) {
      setPhase("reviewed");
    } else {
      setCurrentIdx(i => i + 1);
    }
  };

  const goBack = () => {
    if (currentIdx > 0) setCurrentIdx(i => i - 1);
  };

  /* ── Grouped weakness map (subject -> topics), null-answer-aware ────────── */
  const weaknessGroups = useMemo(() => {
    const bySubject: Record<string, Record<string, PrelimsQuestion[]>> = {};
    activeQuestions.forEach(q => {
      if (!bySubject[q.subject]) bySubject[q.subject] = {};
      if (!bySubject[q.subject][q.syllabus_topic]) bySubject[q.subject][q.syllabus_topic] = [];
      bySubject[q.subject][q.syllabus_topic].push(q);
    });

    return Object.entries(bySubject).map(([subject, topics]) => {
      const topicRows = Object.entries(topics).map(([topic, qs]) => {
        const answerable = qs.every(q => q.correct_answer !== null);
        let status: "gap" | "ontrack" | "pending" = "pending";
        if (answerable) {
          const wrongCount = qs.filter(q => answers[q.question_id] !== q.correct_answer).length;
          status = wrongCount > 0 ? "gap" : "ontrack";
        }
        return { topic, count: qs.length, status };
      });
      const gapCount = topicRows.filter(t => t.status === "gap").length;
      const allPending = topicRows.every(t => t.status === "pending");
      const totalQuestions = topicRows.reduce((s, t) => s + t.count, 0);
      return { subject, topicRows, gapCount, allPending, totalQuestions };
    });
  }, [activeQuestions, answers]);

  const attemptedCount = activeQuestions.filter(q => answers[q.question_id]).length;
  const anyVerified = activeQuestions.some(q => q.correct_answer !== null);
  const correctCount = anyVerified
    ? activeQuestions.filter(q => q.correct_answer !== null && answers[q.question_id] === q.correct_answer).length
    : null;
  const scorablePct = anyVerified && activeQuestions.length > 0
    ? Math.round((correctCount! / activeQuestions.length) * 100)
    : null;

  const pctColor = (p: number) => p >= 75 ? "var(--success)" : p >= 50 ? "var(--warning)" : "var(--danger)";

  /* ══════════════════════════ SETUP ══════════════════════════ */
  if (phase === "setup") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
        <Nav />
        <div className="site-wrap" style={{ paddingTop: 64, paddingBottom: 96, maxWidth: 680 }}>
          <span className="eyebrow">Mock Prelims</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-3xl)", letterSpacing: "-0.02em", marginBottom: 8 }}>
            Practice by topic or by paper
          </h1>
          <p style={{ color: "var(--ink-muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 40, maxWidth: 520 }}>
            Knowledge test is untimed and lets you drill specific subjects. Mock test is a full, timed paper.
          </p>

          {/* Mode cards */}
          <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
            <button
              onClick={() => setMode("knowledge")}
              style={{
                flex: 1, textAlign: "left", padding: 18, borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                border: mode === "knowledge" ? "2px solid var(--accent)" : "1px solid var(--hairline)",
                background: mode === "knowledge" ? "var(--accent-bg)" : "var(--surface)",
              }}
            >
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 15, color: mode === "knowledge" ? "var(--accent)" : "var(--ink)", marginBottom: 4 }}>
                Knowledge test
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>Untimed, pick your subjects</div>
            </button>
            <button
              onClick={() => setMode("mock")}
              style={{
                flex: 1, textAlign: "left", padding: 18, borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                border: mode === "mock" ? "2px solid var(--accent)" : "1px solid var(--hairline)",
                background: mode === "mock" ? "var(--accent-bg)" : "var(--surface)",
              }}
            >
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 15, color: mode === "mock" ? "var(--accent)" : "var(--ink)", marginBottom: 4 }}>
                Mock test
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>Timed, full paper simulation</div>
            </button>
          </div>

          {mode === "knowledge" && (
            <>
              {/* Subject chips */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 10 }}>
                  Subjects — leave blank for all
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {ALL_SUBJECTS.map(subj => {
                    const active = selectedSubjects.includes(subj);
                    return (
                      <button
                        key={subj}
                        onClick={() => toggleSubjectChip(subj)}
                        style={{
                          padding: "6px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                          border: active ? "1px solid var(--accent)" : "1px solid var(--hairline)",
                          background: active ? "var(--accent-bg)" : "transparent",
                          color: active ? "var(--accent)" : "var(--ink-muted)",
                        }}
                      >
                        {subj}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question count */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 10 }}>
                  Number of questions
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[10, 25, 50].map(n => (
                    <button
                      key={n}
                      onClick={() => setQuestionCount(n as 10 | 25 | 50)}
                      style={{
                        padding: "8px 18px", borderRadius: 6, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
                        border: questionCount === n ? "1px solid var(--accent)" : "1px solid var(--hairline)",
                        background: questionCount === n ? "var(--accent-bg)" : "transparent",
                        color: questionCount === n ? "var(--accent)" : "var(--ink-muted)",
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source cards — visually distinct, no "AI generating" language anywhere */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 10 }}>
                  Question source
                </div>

                <button
                  onClick={() => setSourceFilter("pyq")}
                  disabled={ALL_QUESTIONS.filter(q => q.source_type === "pyq").length === 0}
                  style={{
                    display: "block", width: "100%", textAlign: "left", padding: 14, borderRadius: 10, marginBottom: 8, fontFamily: "inherit",
                    border: sourceFilter === "pyq" ? "2px solid var(--ink)" : "1px solid var(--hairline)",
                    background: "var(--surface)", cursor: "pointer", opacity: ALL_QUESTIONS.filter(q => q.source_type === "pyq").length === 0 ? 0.45 : 1,
                  }}
                >
                  <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>Previous year papers</div>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                    {ALL_QUESTIONS.filter(q => q.source_type === "pyq").length === 0
                      ? "Coming soon — none loaded yet"
                      : "Actual UPSC questions, exact wording"}
                  </div>
                </button>

                <button
                  onClick={() => setSourceFilter("compiled")}
                  style={{
                    display: "block", width: "100%", textAlign: "left", padding: 14, borderRadius: 10, marginBottom: 8, fontFamily: "inherit",
                    border: sourceFilter === "compiled" ? "2px solid var(--accent)" : "1px solid var(--hairline)",
                    background: sourceFilter === "compiled" ? "var(--accent-bg)" : "var(--surface)", cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2, color: sourceFilter === "compiled" ? "var(--accent)" : "var(--ink)" }}>
                    Abhyaas compiled
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                    PYQs plus questions built and checked against our syllabus knowledge base
                  </div>
                </button>

                <button
                  onClick={() => setSourceFilter("mix")}
                  style={{
                    display: "block", width: "100%", textAlign: "left", padding: 14, borderRadius: 10, fontFamily: "inherit",
                    border: sourceFilter === "mix" ? "2px solid var(--ink)" : "1px solid var(--hairline)",
                    background: "var(--surface)", cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>Full mix</div>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>Both sources combined, widest coverage</div>
                </button>
              </div>

              <button
                onClick={startKnowledgeTest}
                style={{ padding: "12px 28px", borderRadius: 4, background: "var(--accent)", color: "var(--accent-ink)", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}
              >
                Start knowledge test →
              </button>
            </>
          )}

          {mode === "mock" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 28 }}>
                {SETS.map(set => (
                  <button
                    key={set.id}
                    onClick={() => setSelectedSetId(set.id)}
                    style={{
                      display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "18px 4px",
                      border: "none", borderBottom: "1px solid var(--hairline)", cursor: "pointer", fontFamily: "inherit", textAlign: "left", gap: 16,
                      background: selectedSetId === set.id ? "var(--accent-bg)" : "none",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 15, color: selectedSetId === set.id ? "var(--accent)" : "var(--ink)", marginBottom: 4 }}>
                        {set.label}
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-muted)" }}>
                        {set.paper} · {set.questions.length} questions · {MOCK_DURATION_MINUTES} min
                      </div>
                    </div>
                    <span style={{ color: "var(--ink-faint)", fontSize: 18, flexShrink: 0, paddingTop: 2 }}>→</span>
                  </button>
                ))}
              </div>
              <button
                onClick={startMockTest}
                disabled={!selectedSetId}
                style={{
                  padding: "12px 28px", borderRadius: 4, fontSize: 14, fontWeight: 600, border: "none", fontFamily: "inherit",
                  background: selectedSetId ? "var(--accent)" : "var(--hairline)",
                  color: selectedSetId ? "var(--accent-ink)" : "var(--ink-faint)",
                  cursor: selectedSetId ? "pointer" : "not-allowed",
                }}
              >
                Start mock test →
              </button>
            </>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  /* ══════════════════════════ ANSWERING ══════════════════════════ */
  if (phase === "answering" && currentQ) {
    const selected = answers[currentQ.question_id];
    return (
      <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
        <div style={{ position: "sticky", top: 52, zIndex: 40, background: "var(--paper)", borderBottom: "1px solid var(--hairline)" }}>
          <div className="site-wrap" style={{ display: "flex", alignItems: "center", gap: 16, height: 52 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", whiteSpace: "nowrap" }}>
              {currentQ.subject} · {currentQ.syllabus_topic}
            </span>
            <div style={{ flex: 1 }} />
            {mode === "mock" ? (
              <CountdownTimer
                key={timerKey}
                seconds={MOCK_DURATION_MINUTES * 60}
                onExpire={() => setTimerExpired(true)}
                paused={phase !== "answering"}
              />
            ) : (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-muted)", whiteSpace: "nowrap" }}>
                <strong style={{ color: "var(--ink)" }}>{currentIdx + 1}</strong> / {activeQuestions.length}
              </span>
            )}
          </div>
        </div>

        <div className="site-wrap" style={{ paddingTop: 48, paddingBottom: 80, maxWidth: 680 }}>
          {timerExpired && (
            <div style={{ border: "1px solid var(--warning)", borderRadius: 6, padding: "10px 16px", marginBottom: 20, fontSize: 13, color: "var(--warning)", background: "var(--warning-bg)" }}>
              Time&apos;s up — you can keep going, or submit whenever you&apos;re ready.
            </div>
          )}

          <p style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 500, color: "var(--ink)", lineHeight: 1.6, marginBottom: 24, whiteSpace: "pre-line" }}>
            {currentQ.question_text}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
            {(["a", "b", "c", "d"] as OptionKey[]).map(key => {
              const isSelected = selected === key;
              return (
                <button
                  key={key}
                  onClick={() => selectOption(key)}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 10, textAlign: "left", padding: "12px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit",
                    border: isSelected ? "2px solid var(--accent)" : "1px solid var(--hairline)",
                    background: isSelected ? "var(--accent-bg)" : "var(--surface)",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: isSelected ? "var(--accent)" : "var(--ink-faint)", textTransform: "uppercase", flexShrink: 0, paddingTop: 1 }}>
                    {key}
                  </span>
                  <span style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.5 }}>{currentQ.options[key]}</span>
                </button>
              );
            })}
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, background: "var(--hairline)", borderRadius: 2, marginBottom: 24, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${((currentIdx + 1) / activeQuestions.length) * 100}%`, background: "var(--accent)", borderRadius: 2 }} />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {currentIdx > 0 && (
              <button
                onClick={goBack}
                style={{ padding: "10px 20px", borderRadius: 4, border: "1px solid var(--hairline)", background: "transparent", color: "var(--ink-muted)", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
              >
                ← Back
              </button>
            )}
            <button
              onClick={goNext}
              style={{ padding: "10px 24px", borderRadius: 4, background: "var(--accent)", color: "var(--accent-ink)", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              {isLast ? "Submit and review →" : "Next question →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════ REVIEWED ══════════════════════════ */
  if (phase === "reviewed") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
        <Nav />
        <div className="site-wrap" style={{ paddingTop: 56, paddingBottom: 96, maxWidth: 680 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-muted)", marginBottom: 8 }}>
            Session complete
          </div>

          {/* Score summary — honest about unverified answer keys */}
          {anyVerified ? (
            <div style={{ display: "flex", gap: 40, marginBottom: 40, paddingBottom: 32, borderBottom: "1px solid var(--hairline)", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 700, color: pctColor(scorablePct!), lineHeight: 1 }}>
                  {scorablePct}%
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginTop: 4 }}>Score</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 500, color: "var(--ink)" }}>
                  {correctCount}/{activeQuestions.length}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginTop: 2 }}>Correct</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 500, color: "var(--ink)" }}>
                  {attemptedCount}/{activeQuestions.length}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginTop: 2 }}>Attempted</div>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 40, paddingBottom: 32, borderBottom: "1px solid var(--hairline)" }}>
              <div style={{ border: "1px solid var(--warning)", borderRadius: 8, padding: "14px 16px", background: "var(--warning-bg)", marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--warning)", marginBottom: 2 }}>Answer key pending verification</div>
                <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>Scoring and weakness detection will activate once this set&apos;s answer key is checked.</div>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 500, color: "var(--ink)" }}>
                {attemptedCount}/{activeQuestions.length}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginTop: 2 }}>Attempted</div>
            </div>
          )}

          {/* Weakness map — grouped by subject, collapsed by default */}
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, marginBottom: 4, color: "var(--ink)" }}>Weakness map</h2>
          <p style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 16 }}>Grouped by subject — tap to see topics</p>

          <div style={{ marginBottom: 40 }}>
            {weaknessGroups.map(({ subject, topicRows, gapCount, allPending, totalQuestions }) => {
              const isOpen = expandedSubject === subject;
              const badgeColor = allPending ? "var(--ink-muted)" : gapCount > 0 ? "var(--danger)" : "var(--success)";
              const badgeText = allPending
                ? `Pending · ${totalQuestions} questions`
                : gapCount > 0
                  ? `${gapCount} gap${gapCount > 1 ? "s" : ""} · ${totalQuestions} questions`
                  : `On track · ${totalQuestions} questions`;
              return (
                <div key={subject} style={{ borderBottom: "1px solid var(--hairline)" }}>
                  <button
                    onClick={() => setExpandedSubject(isOpen ? null : subject)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "12px 0", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ display: "inline-block", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .15s", color: "var(--ink-faint)", fontSize: 12 }}>▶</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{subject}</span>
                    </span>
                    <span style={{ fontSize: 12, color: badgeColor, whiteSpace: "nowrap" }}>{badgeText}</span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: "0 0 12px 22px" }}>
                      {topicRows.map(({ topic, status, count }) => (
                        <div key={topic} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
                          <span style={{ fontSize: 13, color: "var(--ink)" }}>{topic}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 12, color: status === "gap" ? "var(--danger)" : status === "ontrack" ? "var(--success)" : "var(--ink-faint)" }}>
                              {status === "gap" ? "Content gap" : status === "ontrack" ? "On track" : `Pending · ${count}`}
                            </span>
                            {status === "gap" && (
                              <button
                                disabled
                                title="Coming soon"
                                style={{ fontSize: 11, padding: "3px 10px", borderRadius: 4, border: "1px solid var(--hairline)", background: "var(--surface)", color: "var(--ink-faint)", cursor: "not-allowed", fontFamily: "inherit" }}
                              >
                                Revise topic
                              </button>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Question review list */}
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, marginBottom: 16, color: "var(--ink)" }}>Question review</h2>
          {activeQuestions.map((q, i) => {
            const yourAnswer = answers[q.question_id];
            const isCorrect = q.correct_answer !== null && yourAnswer === q.correct_answer;
            const borderColor = q.correct_answer === null ? "var(--hairline)" : isCorrect ? "var(--success)" : "var(--danger)";
            return (
              <details key={q.question_id} style={{ borderLeft: `3px solid ${borderColor}`, padding: "10px 0 10px 14px", marginBottom: 8 }}>
                <summary style={{ cursor: "pointer", fontSize: 13, color: "var(--ink)", lineHeight: 1.5 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)", marginRight: 8 }}>Q{i + 1}</span>
                  {q.question_text.slice(0, 90)}{q.question_text.length > 90 ? "…" : ""}
                </summary>
                <div style={{ marginTop: 10, fontSize: 13, color: "var(--ink-muted)" }}>
                  <div style={{ marginBottom: 6 }}>Your answer: <strong style={{ color: "var(--ink)" }}>{yourAnswer ? `${yourAnswer.toUpperCase()} — ${q.options[yourAnswer]}` : "Not attempted"}</strong></div>
                  <div>
                    Correct answer:{" "}
                    <strong style={{ color: "var(--ink)" }}>
                      {q.correct_answer ? `${q.correct_answer.toUpperCase()} — ${q.options[q.correct_answer]}` : "Pending verification"}
                    </strong>
                  </div>
                  {q.explanation && <div style={{ marginTop: 8 }}>{q.explanation}</div>}
                </div>
              </details>
            );
          })}

          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            <button
              onClick={() => setPhase("setup")}
              style={{ padding: "10px 20px", borderRadius: 4, background: "var(--accent)", color: "var(--accent-ink)", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              New session
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return null;
}
