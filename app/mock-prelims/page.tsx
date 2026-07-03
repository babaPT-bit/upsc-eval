"use client";
import { useState, useEffect, useRef } from "react";
import Nav from "../components/Nav";

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  subject: string;
}

const QUESTIONS: Question[] = [
  { subject: "Polity", question: "The ___ Committee recommended the creation of an All India Judicial Service.", options: ["Sarkaria Commission", "Law Commission (14th Report)", "Swaran Singh Committee", "Punchhi Commission"], correct: 1, explanation: "The Law Commission in its 14th Report (1958) recommended an All India Judicial Service for the subordinate judiciary." },
  { subject: "Polity", question: "Which Article empowers the President to declare a Financial Emergency?", options: ["Article 352", "Article 356", "Article 360", "Article 365"], correct: 2, explanation: "Article 360 deals with Financial Emergency. It has never been proclaimed in India so far." },
  { subject: "Polity", question: "The Panchayati Raj system was constitutionalized by which Amendment?", options: ["71st Amendment", "72nd Amendment", "73rd Amendment", "74th Amendment"], correct: 2, explanation: "The 73rd Amendment (1992) added Part IX to the Constitution, establishing a three-tier Panchayati Raj system." },
  { subject: "Polity", question: "Who appoints the Chief Election Commissioner of India?", options: ["Prime Minister", "President", "Chief Justice of India", "Parliament"], correct: 1, explanation: "Article 324(2) — the President appoints the CEC. Since 2023, a committee recommends the appointment." },
  { subject: "Polity", question: "Which schedule of the Constitution deals with anti-defection provisions?", options: ["8th Schedule", "9th Schedule", "10th Schedule", "11th Schedule"], correct: 2, explanation: "The 10th Schedule, added by the 52nd Amendment Act (1985), contains anti-defection provisions." },
  { subject: "Polity", question: "The concept of 'Basic Structure' of the Constitution was established in which case?", options: ["Golaknath v. State of Punjab", "Kesavananda Bharati v. State of Kerala", "Minerva Mills v. Union of India", "Maneka Gandhi v. Union of India"], correct: 1, explanation: "Kesavananda Bharati (1973) established that Parliament cannot alter the basic structure of the Constitution." },
  { subject: "Polity", question: "Which Article of the Constitution deals with the Right to Education?", options: ["Article 21", "Article 21A", "Article 22", "Article 23"], correct: 1, explanation: "Article 21A, inserted by the 86th Amendment (2002), makes free and compulsory education for children aged 6-14 a Fundamental Right." },
  { subject: "Polity", question: "The Directive Principles of State Policy are contained in which Part of the Constitution?", options: ["Part III", "Part IV", "Part IVA", "Part V"], correct: 1, explanation: "Part IV (Articles 36-51) contains the Directive Principles of State Policy, borrowed from the Irish Constitution." },
  { subject: "Polity", question: "Which constitutional body can remove the Chief Election Commissioner from office?", options: ["President alone", "Parliament through impeachment", "Supreme Court", "Cabinet recommendation"], correct: 1, explanation: "The CEC can only be removed through impeachment by Parliament — same procedure as removal of a Supreme Court judge." },
  { subject: "Polity", question: "The term 'Secular' was added to the Preamble of the Constitution by which Amendment?", options: ["42nd Amendment", "44th Amendment", "52nd Amendment", "61st Amendment"], correct: 0, explanation: "The 42nd Amendment Act (1976) added 'Secular' and 'Socialist' to the Preamble during the Emergency." },
  { subject: "Governance", question: "Under Article 356, President's Rule can be extended beyond one year only if:", options: ["The Rajya Sabha passes a resolution", "A national emergency is in operation", "The State Legislative Assembly approves", "The Supreme Court certifies it"], correct: 1, explanation: "President's Rule can be extended beyond 1 year only if a national emergency is in operation in the whole of India or the EC certifies difficulty in holding elections." },
  { subject: "Governance", question: "Which committee recommended the 'three-language formula' for Indian education?", options: ["Kothari Commission", "Mudaliar Commission", "Radhakrishnan Commission", "Yashpal Committee"], correct: 0, explanation: "The Kothari Commission (1964-66) recommended the three-language formula — mother tongue/regional language, Hindi, and English/another modern Indian language." },
  { subject: "Governance", question: "The National Green Tribunal (NGT) was established under which Act?", options: ["Environment Protection Act, 1986", "National Green Tribunal Act, 2010", "Forest Conservation Act, 1980", "Wildlife Protection Act, 1972"], correct: 1, explanation: "The NGT was established under the National Green Tribunal Act, 2010. India is the third country in the world to have a dedicated environmental tribunal." },
  { subject: "Governance", question: "Which Article of the Constitution empowers Parliament to form new states?", options: ["Article 1", "Article 2", "Article 3", "Article 4"], correct: 2, explanation: "Article 3 empowers Parliament, by law, to form new states, increase/decrease areas, and alter names and boundaries of existing states." },
  { subject: "International Relations", question: "The BRICS grouping was originally called BRIC — when was South Africa added?", options: ["2009", "2010", "2011", "2013"], correct: 2, explanation: "South Africa formally joined at the Sanya Summit in 2011, expanding BRIC to BRICS." },
  { subject: "Governance", question: "Which organ of the UN has its headquarters in Nairobi?", options: ["UNCTAD", "UNEP", "UNESCO", "UNICEF"], correct: 1, explanation: "UNEP (UN Environment Programme) is headquartered in Nairobi, Kenya — the only major UN agency with HQ in the developing world." },
  { subject: "Polity", question: "The Comptroller and Auditor General of India is appointed by:", options: ["Prime Minister", "President", "Parliament", "Finance Commission"], correct: 1, explanation: "The CAG is appointed by the President under Article 148 and can be removed only through an address by both Houses of Parliament." },
  { subject: "Governance", question: "Which Article grants the Supreme Court jurisdiction to hear appeals from High Courts in constitutional matters?", options: ["Article 131", "Article 132", "Article 136", "Article 142"], correct: 1, explanation: "Article 132 grants appellate jurisdiction to the Supreme Court in constitutional matters — an appeal lies if the HC certifies it involves a substantial question of law as to interpretation of the Constitution." },
  { subject: "Polity", question: "How many fundamental duties are currently listed in the Constitution?", options: ["9", "10", "11", "12"], correct: 2, explanation: "There are 11 Fundamental Duties — 10 added by the 42nd Amendment (1976) and 1 more added by the 86th Amendment (2002)." },
  { subject: "Governance", question: "The National Human Rights Commission (NHRC) was established under which Act?", options: ["Human Rights Protection Act, 1990", "Protection of Human Rights Act, 1993", "Fundamental Rights Protection Act, 1995", "Constitutional Rights Act, 1988"], correct: 1, explanation: "The NHRC was established in 1993 under the Protection of Human Rights Act, 1993. The chairperson must be a retired Chief Justice of India." },
];

const TOTAL_TIME = 20 * 60; // 20 minutes in seconds

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

type Screen = "select" | "test" | "results";

export default function MockPrelimsPage() {
  const [screen, setScreen] = useState<Screen>("select");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [expandedReview, setExpandedReview] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTest = () => {
    setScreen("test");
    setCurrentQ(0);
    setAnswers(Array(QUESTIONS.length).fill(null));
    setTimeLeft(TOTAL_TIME);
    setElapsed(0);
    setStartTime(Date.now());
  };

  useEffect(() => {
    if (screen !== "test") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setElapsed(TOTAL_TIME);
          setScreen("results");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [screen]);

  const selectAnswer = (optIdx: number) => {
    setAnswers(prev => {
      const next = [...prev];
      next[currentQ] = optIdx;
      return next;
    });
  };

  const goNext = () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(q => q + 1);
    } else {
      setElapsed(TOTAL_TIME - timeLeft);
      if (timerRef.current) clearInterval(timerRef.current);
      setScreen("results");
    }
  };

  const correct = answers.filter((a, i) => a === QUESTIONS[i].correct).length;
  const pct = Math.round((correct / QUESTIONS.length) * 100);
  const answered = answers.filter(a => a !== null).length;

  /* ── SELECT SCREEN ─────────────────────────────────────────────────── */
  if (screen === "select") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
        <Nav />
        <div className="site-wrap" style={{ paddingTop: 64, paddingBottom: 96 }}>
          <span className="eyebrow">Mock Prelims</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-3xl)", letterSpacing: "-0.02em", marginBottom: 12 }}>
            Prelims practice, one question at a time
          </h1>
          <p style={{ color: "var(--ink-muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 48, maxWidth: 520 }}>
            Question-by-question MCQ practice with an answer key built on real PYQ patterns. Timed, scored, reviewed.
          </p>

          <div style={{ border: "1px solid var(--hairline)", borderRadius: 6, background: "var(--surface)", maxWidth: 480 }}>
            <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid var(--hairline)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-muted)", marginBottom: 8 }}>Available sets</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "var(--ink)", marginBottom: 4 }}>GS2 Polity — 20 Questions</div>
              <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>Constitutional provisions, governance, polity. 20 minutes.</div>
            </div>
            <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ display: "flex", gap: 20 }}>
                {[["20", "questions"], ["20 min", "time limit"], ["GS2", "paper"]].map(([num, label]) => (
                  <div key={label}>
                    <div style={{ fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: 15, color: "var(--ink)" }}>{num}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)" }}>{label}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={startTest}
                style={{ marginLeft: "auto", padding: "10px 20px", borderRadius: 4, background: "var(--accent)", color: "var(--accent-ink)", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}
              >
                Start Test →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── TEST SCREEN ───────────────────────────────────────────────────── */
  if (screen === "test") {
    const q = QUESTIONS[currentQ];
    const selected = answers[currentQ];
    const isLast = currentQ === QUESTIONS.length - 1;
    const progress = ((currentQ + (selected !== null ? 1 : 0)) / QUESTIONS.length) * 100;
    const timeIsLow = timeLeft < 180;

    return (
      <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
        {/* Test header — not the marketing nav */}
        <div style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--paper)", borderBottom: "1px solid var(--hairline)" }}>
          <div className="site-wrap" style={{ padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-muted)" }}>
              Question <span style={{ color: "var(--ink)", fontWeight: 500 }}>{currentQ + 1}</span> / {QUESTIONS.length}
            </div>
            <div style={{ height: 3, flex: 1, margin: "0 24px", background: "var(--hairline)", borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent)", borderRadius: 2, transition: "width 0.3s" }} />
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 500, color: timeIsLow ? "var(--danger)" : "var(--ink-muted)", minWidth: 52, textAlign: "right" }}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="site-wrap" style={{ paddingTop: 48, paddingBottom: 96, maxWidth: 640 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-muted)", marginBottom: 16 }}>{q.subject}</div>
          <p style={{ fontSize: 17, fontWeight: 500, color: "var(--ink)", lineHeight: 1.6, marginBottom: 32 }}>{q.question}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
            {q.options.map((opt, i) => {
              const isSelected = selected === i;
              return (
                <button
                  key={i}
                  onClick={() => selectAnswer(i)}
                  style={{
                    textAlign: "left", padding: "14px 18px", border: `1px solid ${isSelected ? "var(--accent)" : "var(--hairline)"}`,
                    borderRadius: 6, background: isSelected ? "var(--accent-bg)" : "var(--surface)",
                    color: isSelected ? "var(--ink)" : "var(--ink-muted)", fontSize: 14, fontFamily: "inherit",
                    cursor: "pointer", transition: "all 0.12s",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, marginRight: 12, color: isSelected ? "var(--accent)" : "var(--ink-faint)" }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <button
              onClick={goNext}
              style={{ padding: "10px 24px", borderRadius: 4, background: "var(--accent)", color: "var(--accent-ink)", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              {isLast ? "Submit Test" : "Next →"}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ── RESULTS SCREEN ────────────────────────────────────────────────── */
  const elapsedFmt = formatTime(elapsed);
  const scoreColor = pct >= 75 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "var(--danger)";

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
      <Nav />
      <div className="site-wrap" style={{ paddingTop: 56, paddingBottom: 96, maxWidth: 720 }}>
        {/* Score header */}
        <div style={{ marginBottom: 40, paddingBottom: 40, borderBottom: "1px solid var(--hairline)" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-muted)", marginBottom: 8 }}>Test complete</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 16 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-4xl)", fontWeight: 700, lineHeight: 1, color: scoreColor }}>{pct}%</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: "var(--ink-muted)", paddingBottom: 8 }}>{correct} / {QUESTIONS.length}</span>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            {[["Score", `${pct}%`], ["Time", elapsedFmt], ["Attempted", `${answered}/${QUESTIONS.length}`]].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{val}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Per-question review */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, marginBottom: 20, color: "var(--ink)" }}>Question Review</h2>
          {QUESTIONS.map((q, i) => {
            const userAnswer = answers[i];
            const isCorrect = userAnswer === q.correct;
            const isOpen = expandedReview === i;
            return (
              <div key={i} style={{ borderLeft: `3px solid ${isCorrect ? "var(--success)" : "var(--danger)"}`, paddingLeft: 16, marginBottom: 16 }}>
                <button
                  onClick={() => setExpandedReview(isOpen ? null : i)}
                  style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "8px 0", fontFamily: "inherit" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)", minWidth: 24 }}>Q{i + 1}</span>
                    <span style={{ fontSize: 14, color: "var(--ink)", flex: 1, lineHeight: 1.5, textAlign: "left" }}>{q.question}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: isCorrect ? "var(--success)" : "var(--danger)", flexShrink: 0 }}>{isCorrect ? "Correct" : "Wrong"}</span>
                    <span style={{ color: "var(--ink-faint)", fontSize: 12 }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </button>
                {isOpen && (
                  <div style={{ paddingBottom: 12 }}>
                    {q.options.map((opt, j) => (
                      <div key={j} style={{ fontSize: 13, padding: "4px 0", color: j === q.correct ? "var(--success)" : j === userAnswer ? "var(--danger)" : "var(--ink-muted)", display: "flex", gap: 10 }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "inherit" }}>{String.fromCharCode(65 + j)}</span>
                        <span>{opt}{j === q.correct ? " ✓" : j === userAnswer && userAnswer !== q.correct ? " ✗" : ""}</span>
                      </div>
                    ))}
                    <p style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 10, lineHeight: 1.6, borderLeft: "2px solid var(--hairline)", paddingLeft: 12 }}>{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => { setScreen("select"); }}
          style={{ padding: "10px 24px", borderRadius: 4, background: "var(--accent)", color: "var(--accent-ink)", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}
        >
          Practice Again
        </button>
      </div>
    </div>
  );
}
