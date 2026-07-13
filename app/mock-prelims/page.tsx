"use client";
import { useState, useCallback } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import CountdownTimer from "../components/CountdownTimer";
import prelimsData from "../../content/mock-prelims-questions.json";

/* ── Types ──────────────────────────────────────────────────────────────── */
type OptionKey = "a" | "b" | "c" | "d";

interface PrelimsQuestion {
  question_id: string;
  question_text: string;
  options: Record<OptionKey, string>;
  correct_answer: OptionKey | null;
  explanation: string | null;
  paper: string;
  subject: string;
  syllabus_topic: string;
  source_type: string;
  source_detail: string;
  marks: number;
  difficulty: string | null;
  answer_verified: boolean;
}

interface QuestionSet {
  id: string;
  label: string;
  paper: string;
  source: string;
  questions: PrelimsQuestion[];
}

type Mode = "knowledge" | "mock";
type SourceCard = "pyq" | "compiled" | "mixed";
type Phase = "setup" | "answering" | "reviewed";

const ALL_SETS = prelimsData.question_sets as QuestionSet[];
const ALL_QUESTIONS: PrelimsQuestion[] = ALL_SETS.flatMap(s => s.questions);

// Data-driven — pull the full subject list from what's actually in the seed data, not a hardcoded guess.
const SUBJECT_CHIPS = Array.from(new Set(ALL_QUESTIONS.map(q => q.subject))).sort();
const QUESTION_COUNTS = [10, 25, 50] as const;

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

function sourceCardMatches(sourceType: string, card: SourceCard): boolean {
  if (card === "mixed") return true;
  if (card === "pyq") return sourceType === "pyq";
  return sourceType === "compiled" || sourceType === "generated"; // "Abhyaas compiled"
}

// Same grading thresholds as EvalResultCard.tsx — do not diverge from this scheme.
const pctColor = (p: number) => p >= 75 ? "var(--success)" : p >= 50 ? "var(--warning)" : "var(--danger)";

/* ── Minimal inline icons (matches the app's hand-rolled stroke-icon style) ── */
function IconCertificate({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <circle cx="12" cy="9.5" r="2" />
      <path d="M9 20l1.5-3h3L15 20" />
    </svg>
  );
}
function IconStack({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
      <path d="M3 18l9 5 9-5" />
    </svg>
  );
}
function IconGrid({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function IconChevron({ size = 14, rotated }: { size?: number; rotated: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: rotated ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s", flexShrink: 0 }}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

const SOURCE_CARDS: { id: SourceCard; label: string; desc: string; icon: (p: { size?: number }) => React.JSX.Element }[] = [
  { id: "pyq", label: "Previous year papers", desc: "Actual UPSC questions, exact wording", icon: IconCertificate },
  { id: "compiled", label: "Abhyaas compiled", desc: "PYQs plus questions built and checked against our syllabus knowledge base", icon: IconStack },
  { id: "mixed", label: "Full mix", desc: "Both sources combined, widest coverage", icon: IconGrid },
];

/* ── Component ───────────────────────────────────────────────────────────── */
export default function MockPrelimsPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [mode, setMode] = useState<Mode>("knowledge");

  // Knowledge test config
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [sourceCard, setSourceCard] = useState<SourceCard>("compiled");

  // Session state (shared by both modes)
  const [questions, setQuestions] = useState<PrelimsQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, OptionKey | null>>({});
  const [timedOut, setTimedOut] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});

  const toggleSubject = (s: string) => {
    setSelectedSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const knowledgePool = selectedSubjects.length === 0
    ? []
    : ALL_QUESTIONS.filter(q => selectedSubjects.includes(q.subject) && sourceCardMatches(q.source_type, sourceCard));

  const startKnowledgeTest = () => {
    const selected = shuffle(knowledgePool).slice(0, questionCount);
    setQuestions(selected);
    setAnswers(Object.fromEntries(selected.map(q => [q.question_id, null])));
    setCurrentIdx(0);
    setTimedOut(false);
    setExpandedExplanations({});
    setExpandedSubjects({});
    setPhase("answering");
  };

  const startMockTest = (set: QuestionSet) => {
    const selected = shuffle(set.questions);
    setQuestions(selected);
    setAnswers(Object.fromEntries(selected.map(q => [q.question_id, null])));
    setCurrentIdx(0);
    setTimedOut(false);
    setTotalSeconds(selected.length * SECONDS_PER_QUESTION);
    setTimerKey(k => k + 1);
    setExpandedExplanations({});
    setExpandedSubjects({});
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
      const asSet: QuestionSet = { id: "retry", label: "Retry", paper: "", source: "mock", questions };
      startMockTest(asSet);
    } else {
      const selected = shuffle(questions);
      setQuestions(selected);
      setAnswers(Object.fromEntries(selected.map(q => [q.question_id, null])));
      setCurrentIdx(0);
      setTimedOut(false);
      setExpandedExplanations({});
      setExpandedSubjects({});
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

              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 10 }}>
                Question count
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
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

              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 10 }}>
                Question source
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
                {SOURCE_CARDS.map(card => {
                  const isSelected = sourceCard === card.id;
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.id}
                      onClick={() => setSourceCard(card.id)}
                      style={{
                        textAlign: "left", padding: "14px 14px 12px", borderRadius: 8,
                        border: `1.5px solid ${isSelected ? "var(--accent)" : "var(--hairline)"}`,
                        background: isSelected ? "var(--accent-bg)" : "var(--surface)",
                        cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      <div style={{ color: isSelected ? "var(--accent)" : "var(--ink-faint)", marginBottom: 8 }}>
                        <Icon size={18} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>{card.label}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-muted)", lineHeight: 1.45 }}>{card.desc}</div>
                    </button>
                  );
                })}
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
    // Answer key honesty guard: if ANY question in this session lacks a verified
    // correct_answer, we cannot compute a real score — show a pending state
    // instead of a fabricated percentage.
    const hasUnverified = questions.some(q => q.correct_answer === null);
    const scorable = questions.filter(q => q.correct_answer !== null);
    const correct = scorable.filter(q => answers[q.question_id] === q.correct_answer).length;
    const pct = scorable.length > 0 ? Math.round((correct / scorable.length) * 100) : 0;

    // Weakness map grouped by subject, drilling into syllabus_topic on expand.
    // TODO: once a shared weakness store exists (fed by both Mains long-form
    // evaluation and Prelims MCQ results), write this per-topic correct/attempted
    // tally there instead of only computing it locally here. The syllabus_topic
    // values already come straight from the seed data's KB-aligned tagging, so
    // no taxonomy translation should be needed at that integration point.
    const bySubject: Record<string, Record<string, { attempted: number; correct: number; scorable: number }>> = {};
    questions.forEach(q => {
      bySubject[q.subject] ??= {};
      bySubject[q.subject][q.syllabus_topic] ??= { attempted: 0, correct: 0, scorable: 0 };
      const bucket = bySubject[q.subject][q.syllabus_topic];
      if (answers[q.question_id] !== null) bucket.attempted++;
      if (q.correct_answer !== null) {
        bucket.scorable++;
        if (answers[q.question_id] === q.correct_answer) bucket.correct++;
      }
    });

    const subjectRows = Object.entries(bySubject).map(([subject, topics]) => {
      const topicRows = Object.entries(topics).map(([topic, t]) => ({
        topic, ...t,
        pct: t.scorable > 0 ? Math.round((t.correct / t.scorable) * 100) : null,
      }));
      const totalQCount = questions.filter(q => q.subject === subject).length;
      const gapCount = topicRows.filter(t => t.pct !== null && t.pct < 50).length;
      return { subject, topicRows, gapCount, totalQCount };
    }).sort((a, b) => b.gapCount - a.gapCount);

    return (
      <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
        <Nav />
        <div className="site-wrap" style={{ paddingTop: 56, paddingBottom: 96, maxWidth: 680 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-muted)", marginBottom: 8 }}>
            {timedOut ? "Time's up — " : ""}Session complete
          </div>

          {hasUnverified ? (
            <div style={{ border: "1px solid var(--warning)", borderRadius: 8, background: "var(--warning-bg)", padding: "20px 24px", marginBottom: 40 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "var(--warning)", marginBottom: 6 }}>
                Answer key pending verification
              </div>
              <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6 }}>
                {scorable.length === 0
                  ? "This set's answer key hasn't been verified yet, so we can't show a score. Your responses are saved below for review once it's ready."
                  : `Only ${scorable.length} of ${questions.length} questions in this set have a verified answer key. Showing a partial score below — the rest are marked pending.`}
              </p>
              {scorable.length > 0 && (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginTop: 20 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 700, lineHeight: 1, color: pctColor(pct) }}>{pct}%</span>
                  <div style={{ paddingBottom: 6 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: "var(--ink-muted)" }}>{correct} / {scorable.length}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)" }}>correct (verified only)</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginBottom: 40, paddingBottom: 40, borderBottom: "1px solid var(--hairline)" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 64, fontWeight: 700, lineHeight: 1, color: pctColor(pct) }}>{pct}%</span>
              <div style={{ paddingBottom: 8 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: "var(--ink-muted)" }}>{correct} / {scorable.length}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)" }}>correct</div>
              </div>
            </div>
          )}

          {/* Weakness map — subject rows collapsed by default, expand to topic breakdown */}
          {subjectRows.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 14 }}>
                Weakness map — by subject
              </div>
              {subjectRows.map(row => {
                const isOpen = !!expandedSubjects[row.subject];
                const hasScorableTopics = row.topicRows.some(t => t.pct !== null);
                return (
                  <div key={row.subject} style={{ borderBottom: "1px solid var(--hairline)" }}>
                    <button
                      onClick={() => setExpandedSubjects(prev => ({ ...prev, [row.subject]: !prev[row.subject] }))}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 0", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <IconChevron rotated={isOpen} />
                        <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500 }}>{row.subject}</span>
                      </div>
                      {hasScorableTopics ? (
                        <span style={{
                          fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                          color: row.gapCount > 0 ? "var(--danger)" : "var(--success)",
                          background: row.gapCount > 0 ? "var(--danger-bg)" : "var(--success-bg)",
                          whiteSpace: "nowrap",
                        }}>
                          {row.gapCount > 0 ? `${row.gapCount} gap${row.gapCount !== 1 ? "s" : ""}` : "On track"} · {row.totalQCount}q
                        </span>
                      ) : (
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)", whiteSpace: "nowrap" }}>
                          Pending · {row.totalQCount}q
                        </span>
                      )}
                    </button>
                    {isOpen && (
                      <div style={{ paddingLeft: 22, paddingBottom: 12 }}>
                        {row.topicRows.map(t => {
                          const isGap = t.pct !== null && t.pct < 50;
                          const isPending = t.pct === null;
                          return (
                            <div key={t.topic} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "8px 0" }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, color: "var(--ink)", marginBottom: 2 }}>{t.topic}</div>
                                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)" }}>
                                  {isPending ? "pending answer key" : `${t.correct}/${t.scorable} correct`}
                                </div>
                              </div>
                              {!isPending && (
                                <span style={{
                                  fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                                  color: isGap ? "var(--danger)" : "var(--success)",
                                  background: isGap ? "var(--danger-bg)" : "var(--success-bg)",
                                  whiteSpace: "nowrap",
                                }}>
                                  {isGap ? "Content gap" : "On track"}
                                </span>
                              )}
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
                  </div>
                );
              })}
            </div>
          )}

          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, marginBottom: 16, color: "var(--ink)" }}>Full review</h2>
          {questions.map((q, i) => {
            const chosen = answers[q.question_id];
            const isPending = q.correct_answer === null;
            const isCorrect = !isPending && chosen === q.correct_answer;
            const isSkipped = chosen === null;
            const isExpanded = !!expandedExplanations[q.question_id];
            const borderColor = isPending ? "var(--hairline)" : isSkipped ? "var(--hairline)" : isCorrect ? "var(--success)" : "var(--danger)";
            return (
              <div
                key={q.question_id}
                style={{ paddingLeft: 14, paddingBottom: 20, marginBottom: 20, borderLeft: `3px solid ${borderColor}`, borderBottom: "1px solid var(--hairline)" }}
              >
                <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)" }}>Q{i + 1}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)" }}>{q.syllabus_topic}</span>
                  {isPending && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--warning)", border: "1px solid var(--warning)", borderRadius: 2, padding: "1px 6px" }}>
                      Pending
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.65, marginBottom: 12, whiteSpace: "pre-line" }}>{q.question_text}</p>

                <div style={{ display: "flex", gap: 24, marginBottom: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 2 }}>Your answer</div>
                    <div style={{ fontSize: 13, color: isSkipped ? "var(--ink-faint)" : isPending ? "var(--ink-muted)" : isCorrect ? "var(--success)" : "var(--danger)" }}>
                      {isSkipped ? "Not answered" : `${chosen!.toUpperCase()}. ${q.options[chosen!]}`}
                    </div>
                  </div>
                  {isPending ? (
                    <div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 2 }}>Correct answer</div>
                      <div style={{ fontSize: 13, color: "var(--warning)" }}>Pending verification</div>
                    </div>
                  ) : !isCorrect && (
                    <div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 2 }}>Correct answer</div>
                      <div style={{ fontSize: 13, color: "var(--success)" }}>{q.correct_answer!.toUpperCase()}. {q.options[q.correct_answer!]}</div>
                    </div>
                  )}
                </div>

                {q.explanation ? (
                  <>
                    <button
                      onClick={() => setExpandedExplanations(prev => ({ ...prev, [q.question_id]: !prev[q.question_id] }))}
                      style={{ background: "none", border: "none", padding: 0, fontSize: 12, color: "var(--accent)", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      {isExpanded ? "Hide explanation ▲" : "Show explanation ▼"}
                    </button>
                    {isExpanded && (
                      <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 4, padding: "10px 14px", marginTop: 10 }}>
                        <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.65 }}>{q.explanation}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p style={{ fontSize: 12, color: "var(--ink-faint)", fontStyle: "italic" }}>Explanation not yet available.</p>
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
  // Minimal chrome — no global Nav/Footer, matching the distraction-free intent
  // of mock-mains' answering phase (same route hides them the same way there).
  if (questions.length === 0) return null;
  const q = questions[currentIdx];
  const chosen = answers[q.question_id];
  const isLast = currentIdx === questions.length - 1;
  const answered = Object.values(answers).filter(v => v !== null).length;
  const optionKeys: OptionKey[] = ["a", "b", "c", "d"];

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: "var(--paper)", borderBottom: "1px solid var(--hairline)" }}>
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
                  onClick={() => selectOption(q.question_id, key)}
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

        {/* Thin progress bar at bottom */}
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
