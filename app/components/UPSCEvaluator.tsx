"use client";
import { useState, useRef, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   SAMPLE DATA
═══════════════════════════════════════════════════════════════════════════ */

const SAMPLE_PYQ: Record<string, Record<string, Array<{ id: string; q: string; marks: number }>>> = {
  GS1: {
    "2024": [
      { id: "gs1-2024-1", q: "What were the main factors responsible for the rise of the Bhakti Movement in medieval India? How did it contribute to social reform?", marks: 15 },
      { id: "gs1-2024-2", q: "Examine the role of the Indian diaspora in shaping India's foreign policy in the 21st century.", marks: 10 },
    ],
    "2023": [
      { id: "gs1-2023-1", q: "Discuss the contribution of Maulana Abul Kalam Azad to the national movement and his vision for education in India.", marks: 15 },
    ],
  },
  GS2: {
    "2024": [
      { id: "gs2-2024-1", q: "Critically examine the role of the Governor in the Indian federal system. Has the office lived up to its constitutional expectations?", marks: 15 },
      { id: "gs2-2024-2", q: "Discuss the significance of the 73rd and 74th Constitutional Amendments in strengthening grassroots democracy in India.", marks: 10 },
    ],
    "2023": [
      { id: "gs2-2023-1", q: "Analyze the impact of judicial activism on the principle of separation of powers in India.", marks: 15 },
    ],
  },
  GS3: {
    "2024": [
      { id: "gs3-2024-1", q: "Evaluate the role of NITI Aayog in promoting cooperative federalism. How effective has it been compared to the erstwhile Planning Commission?", marks: 15 },
      { id: "gs3-2024-2", q: "What are the major challenges to India's internal security? Discuss the role of technology in addressing these challenges.", marks: 10 },
    ],
  },
  GS4: {
    "2024": [
      { id: "gs4-2024-1", q: "What do you understand by 'crisis of conscience'? Discuss with the help of a real-life example from public administration.", marks: 10 },
    ],
  },
};

// Flat list of all PYQ questions for the question picker dropdown
const FLAT_PYQ: Array<{ id: string; q: string; marks: number; paper: string }> =
  Object.entries(SAMPLE_PYQ).flatMap(([paper, years]) =>
    Object.entries(years).flatMap(([, questions]) =>
      questions.map(q => ({ ...q, paper }))
    )
  );

const SAMPLE_CURRENT_AFFAIRS = [
  { title: "SC ruling on Governor's assent powers — implications for federalism", source: "The Hindu", time: "3 hours ago", tag: "GS2" },
  { title: "NITI Aayog releases SDG India Index 2026 — Kerala tops, Bihar last", source: "PIB", time: "Today", tag: "GS3" },
  { title: "India-EU FTA Round 5 concludes — key sticking points remain", source: "LiveMint", time: "Yesterday", tag: "GS2" },
  { title: "RBI holds repo rate at 6% — inflation concerns ease", source: "Economic Times", time: "2 days ago", tag: "GS3" },
  { title: "New Criminal Laws (BNS, BNSS, BSA) — 6 months of implementation review", source: "Indian Express", time: "3 days ago", tag: "GS2" },
];

const TIPS = [
  "For 'critically examine' questions, examiners expect a 40% for / 40% against / 20% your position split.",
  "Examiners spend about 90 seconds per answer. Your introduction and conclusion carry outsized weight.",
  "The 7-5-3 rule: 15-mark answers need ~7 points, 10-mark need ~5, 5-mark need ~3.",
  "Generic conclusions like 'Thus, a balanced approach is needed' actively lose marks. Be specific.",
  "Depth markers matter: cite specific articles, acts, committee reports, or case studies — not just concepts.",
  "Time allocation: spend 7 minutes on a 10-mark answer, 10 minutes on 15-mark. No more.",
  "Start with a crisp opening line that directly addresses the question. Never start with 'Since time immemorial...'",
  "A way forward section at the end is expected for most Discuss/Examine questions. Don't skip it.",
];

const DID_YOU_KNOW = [
  { big: "Article 356", fact: "President's Rule has been imposed 132 times since 1950. The most frequent decade was the 1970s with 40 impositions.", tags: ["GS2", "Polity"] },
  { big: "90 seconds", fact: "That's roughly how long a UPSC examiner spends on each answer. Your introduction and conclusion are read most carefully.", tags: ["Strategy"] },
  { big: "45–50%", fact: "The average UPSC Mains score across all candidates. Scoring above 55% consistently puts you in the top bracket.", tags: ["Scoring"] },
  { big: "Article 21", fact: "The most litigated fundamental right. The Supreme Court has expanded its scope to include privacy, dignity, clean environment, and livelihood.", tags: ["GS2", "Polity"] },
  { big: "7-5-3 Rule", fact: "15-mark answers need ~7 substantive points, 10-mark need ~5, and 5-mark need ~3. Point density is a key scoring dimension.", tags: ["Strategy"] },
  { big: "73rd Amendment", fact: "Added Part IX to the Constitution in 1992, creating a three-tier Panchayati Raj system. It reserved 1/3 seats for women — now 50% in many states.", tags: ["GS2", "Polity"] },
  { big: "NITI Aayog", fact: "Replaced the Planning Commission in 2015. Unlike its predecessor, it has no power to allocate funds — it's a think tank, not a funding body.", tags: ["GS2", "Governance"] },
  { big: "Sarkaria Commission", fact: "Set up in 1983 to examine Centre-State relations. Its key recommendation — the Governor should be a non-political person — is still frequently violated.", tags: ["GS2", "Federalism"] },
];

const QUIZ_QUESTIONS = [
  { question: "The ___ Committee recommended the creation of an All India Judicial Service.", options: ["Sarkaria Commission", "Law Commission (14th Report)", "Swaran Singh Committee", "Punchhi Commission"], correct: 1, explanation: "The Law Commission in its 14th Report (1958) recommended an All India Judicial Service for the subordinate judiciary." },
  { question: "Which Article empowers the President to declare a Financial Emergency?", options: ["Article 352", "Article 356", "Article 360", "Article 365"], correct: 2, explanation: "Article 360 deals with Financial Emergency. It has never been proclaimed in India so far." },
  { question: "The Panchayati Raj system was constitutionalized by which Amendment?", options: ["71st Amendment", "72nd Amendment", "73rd Amendment", "74th Amendment"], correct: 2, explanation: "The 73rd Amendment (1992) added Part IX to the Constitution, establishing a three-tier Panchayati Raj system." },
  { question: "Who appoints the Chief Election Commissioner of India?", options: ["Prime Minister", "President", "Chief Justice of India", "Parliament"], correct: 1, explanation: "Article 324(2) — the President appoints the CEC. Since 2023, a committee (PM + LoP + CJI) recommends the appointment." },
  { question: "Which schedule of the Constitution deals with anti-defection provisions?", options: ["8th Schedule", "9th Schedule", "10th Schedule", "11th Schedule"], correct: 2, explanation: "The 10th Schedule, added by the 52nd Amendment Act (1985), contains anti-defection provisions." },
  { question: "The concept of 'Basic Structure' of the Constitution was established in which case?", options: ["Golaknath v. State of Punjab", "Kesavananda Bharati v. State of Kerala", "Minerva Mills v. Union of India", "Maneka Gandhi v. Union of India"], correct: 1, explanation: "Kesavananda Bharati (1973) established that Parliament cannot alter the basic structure of the Constitution." },
];

// Fallback mock result — used when API is unavailable or returns an error
const MOCK_RESULT: EvalResult = {
  overallScore: 5.4,
  maxScore: 10,
  percentage: 54,
  directive: "CRITICALLY EXAMINE",
  syllabusTag: "GS2 — Indian Constitution",
  wordCount: 287,
  examinerVerdict:
    "The answer demonstrates a reasonable understanding of the topic but lacks depth in constitutional analysis. The candidate correctly identifies key structural issues but fails to support claims with specific constitutional provisions or landmark judgments. Structure is satisfactory but the conclusion is generic.",
  dimensions: [
    { name: "Question Comprehension", weight: "20%", score: 6, max: 10, comment: "The core demand was understood, but the answer occasionally drifts from the directive." },
    { name: "Point Density", weight: "15%", score: 5, max: 10, comment: "Approximately 6 points found. For a 15-mark answer, 7-8 substantive points are expected." },
    { name: "Factual Accuracy", weight: "20%", score: 6, max: 10, comment: "No critical errors, but some claims are vague and unsubstantiated." },
    { name: "Syllabus Alignment", weight: "10%", score: 7, max: 10, comment: "Content is well-aligned with the GS2 syllabus section on Constitutional bodies." },
    { name: "Answer Structure", weight: "15%", score: 5, max: 10, comment: "Introduction and body are present. Conclusion lacks a forward-looking dimension." },
    { name: "Current Affairs", weight: "10%", score: 4, max: 10, comment: "Recent developments (2023-24 Governor controversies) are not mentioned." },
    { name: "Presentation", weight: "10%", score: 5, max: 10, comment: "Headings are absent. Use bold sub-headings to guide the examiner." },
  ],
  factualErrors: [
    {
      severity: "moderate" as const,
      errorText: "The Governor is appointed by the President on the advice of the Prime Minister.",
      whatIsWrong: "The Constitution says the Governor is appointed by the President. Conventionally the Home Ministry advises — this is not codified, and the PM is not the sole advisor.",
      correction: "Article 155 states the Governor is appointed by the President. No formal advice requirement from the PM is specified in the Constitution.",
    },
  ],
  improvements: [
    "Add specific constitutional articles: Articles 153, 154, 155, 156, 157, 163, and 164 are central to this topic.",
    "Cite the Sarkaria Commission (1983) and Punchhi Commission (2010) recommendations on the Governor's role.",
    "Mention recent controversies: Kerala, Tamil Nadu, Punjab Governors refusing Bills — adds critical current-affairs depth.",
  ],
  summary: {
    strengths: ["Logical structure", "Correct syllabus focus"],
    weaknesses: ["Lacks constitutional citations", "Generic conclusion", "Missing current affairs"],
    topRecommendation:
      "Add 3-4 specific constitutional articles and at least one landmark Supreme Court case (Shamsher Singh v. State of Punjab, 1974) to significantly boost your factual accuracy score.",
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════════════════ */

type Screen = "entry" | "loading" | "results";
type EntryTab = "pyq" | "write" | "pdf";
type ResultTab = "scores" | "errors" | "improve" | "text";

interface PYQItem { id: string; q: string; marks: number; }
interface Dimension { name: string; weight: string; score: number; max: number; comment: string; }
interface FactualError { severity: "critical" | "moderate" | "minor"; errorText: string; whatIsWrong: string; correction: string; }
interface EvalResult {
  overallScore: number; maxScore: number; percentage: number;
  directive: string; syllabusTag: string; wordCount: number;
  examinerVerdict: string;
  dimensions: Dimension[];
  factualErrors: FactualError[];
  improvements: string[];
  summary: { strengths: string[]; weaknesses: string[]; topRecommendation: string; };
}
interface Attempt { num: number; percentage: number; result: EvalResult; }
type DimFeedback = Record<string, "agree" | "disagree">;
type ErrFeedback = Record<number, "correct" | "wrong">;

/* ═══════════════════════════════════════════════════════════════════════════
   API RESPONSE MAPPER
═══════════════════════════════════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiResponse(apiData: any): EvalResult {
  const answer = apiData.answers?.[0];
  if (!answer) throw new Error("No answers in response");

  const evaluation = answer.evaluation || {};
  const dimensions: Dimension[] = [];

  const dimMap: Record<string, { weight: string }> = {
    question_comprehension: { weight: "20%" },
    factual_accuracy:       { weight: "20%" },
    syllabus_alignment:     { weight: "15%" },
    current_affairs:        { weight: "10%" },
    answer_structure:       { weight: "15%" },
    point_density:          { weight: "15%" },
    presentation:           { weight: "5%"  },
  };

  for (const [key, config] of Object.entries(dimMap)) {
    const dim = evaluation[key];
    if (dim) {
      dimensions.push({
        name: key.split("_").map((w: string) => w[0].toUpperCase() + w.slice(1)).join(" "),
        weight: config.weight,
        score: dim.score ?? 0,
        max: 10,
        comment: dim.comment ?? "",
      });
    }
  }

  // V1 fallback
  if (dimensions.length === 0 && answer.dimensions) {
    for (const dim of answer.dimensions) {
      dimensions.push({
        name: dim.name,
        weight: "",
        score: dim.score,
        max: dim.max || 10,
        comment: dim.comment || "",
      });
    }
  }

  const factualErrors: FactualError[] = [];
  const rawErrors = evaluation.factual_accuracy?.errors || answer.factualErrors || [];
  for (const err of rawErrors) {
    factualErrors.push({
      severity: (err.severity || "moderate") as "critical" | "moderate" | "minor",
      errorText: err.error_text || err.text || "",
      whatIsWrong: err.what_is_wrong || "",
      correction: err.correction || "",
    });
  }

  const improvements: string[] = evaluation.top_3_improvements || answer.improvements || [];
  const summary = apiData.summary || {};

  return {
    overallScore: answer.overallScore ?? evaluation.overall_score ?? 0,
    maxScore: answer.maxScore ?? 10,
    percentage: evaluation.overall_percentage ?? summary.percentage ?? 0,
    directive: ((answer.directive?.directive || "") as string).replace(/_/g, " ").toUpperCase(),
    syllabusTag: answer.syllabus ? `${answer.syllabus.paper} — ${answer.syllabus.topic}` : "",
    wordCount: answer.metrics?.word_count ?? 0,
    examinerVerdict: evaluation.examiner_verdict || "",
    dimensions,
    factualErrors,
    improvements,
    summary: {
      strengths: summary.strengths || [],
      weaknesses: summary.weaknesses || [],
      topRecommendation: summary.topRecommendation || "",
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   SVG ICONS
═══════════════════════════════════════════════════════════════════════════ */

function IconBook({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
function IconPen({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function IconUpload({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}
function IconCheck({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconSpinner({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: "upscSpin 0.8s linear infinite", display: "block" }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
function IconArrowRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
function IconBold({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  );
}
function IconUnderline({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" /><line x1="4" y1="21" x2="20" y2="21" />
    </svg>
  );
}
function IconHeading({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h16M4 6h16M4 18h10" />
    </svg>
  );
}
function IconList({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}
function IconWarning({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconThumbUp({ size = 13, filled = false }: { size?: number; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}
function IconThumbDown({ size = 13, filled = false }: { size?: number; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
      <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </svg>
  );
}
function IconRefresh({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}
function IconShare({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
function IconStar({ size = 22, filled = false }: { size?: number; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function IconX({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconMoon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function IconSun({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}
function IconChevronDown({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCORE RING
═══════════════════════════════════════════════════════════════════════════ */

function ScoreRing({ score, max, size = 96 }: { score: number; max: number; size?: number }) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 120); return () => clearTimeout(t); }, []);
  const sw = 7, r = (size - sw * 2) / 2, circ = 2 * Math.PI * r;
  const pct = (score / max) * 100;
  const offset = on ? circ - (pct / 100) * circ : circ;
  const col = pct >= 75 ? "#448361" : pct >= 50 ? "#C29243" : "#D44C47";
  const lbl = pct >= 75 ? "Good" : pct >= 50 ? "Average" : "Needs Work";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--c-border)" strokeWidth={sw} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={sw}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'Noto Serif', Georgia, serif", fontWeight: 700, fontSize: size * 0.2, color: col, lineHeight: 1 }}>{Math.round(pct)}%</span>
        </div>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: col, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.07em", textTransform: "uppercase" }}>{lbl}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATED SCORE BAR
═══════════════════════════════════════════════════════════════════════════ */

function ScoreBar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), delay + 50); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{ height: 5, borderRadius: 3, background: "var(--c-border)", overflow: "hidden", margin: "6px 0 5px" }}>
      <div style={{ height: "100%", borderRadius: 3, background: color, width: on ? `${pct}%` : "0%", transition: "width 0.7s ease" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   NOTION EDITOR
═══════════════════════════════════════════════════════════════════════════ */

interface NotionEditorProps {
  onChange: (html: string, text: string) => void;
  resetKey?: number;
  placeholder?: string;
  minHeight?: number;
}

function NotionEditor({ onChange, resetKey = 0, placeholder = "Write your answer here...", minHeight = 280 }: NotionEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [words, setWords] = useState(0);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (ref.current) { ref.current.innerHTML = ""; setWords(0); onChange("", ""); }
  }, [resetKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const countWords = (t: string) => t.trim().split(/\s+/).filter(w => w.length > 0).length;

  const onInput = () => {
    if (!ref.current) return;
    const text = ref.current.innerText || "";
    setWords(countWords(text));
    onChange(ref.current.innerHTML || "", text);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") { e.preventDefault(); document.execCommand("insertText", false, "    "); }
  };

  const fmt = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    ref.current?.focus();
    onInput();
  };

  const tbBtn = (title: string, onClick: () => void, icon: React.ReactNode) => (
    <button type="button" title={title}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      style={{ padding: "4px 6px", border: "1px solid transparent", borderRadius: 4, background: "transparent", color: "var(--c-text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
      onMouseEnter={e => { e.currentTarget.style.background = "var(--c-surface-hover)"; e.currentTarget.style.borderColor = "var(--c-border)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}>
      {icon}
    </button>
  );

  return (
    <div style={{ border: `1px solid ${focused ? "var(--c-accent)" : "var(--c-border)"}`, borderRadius: 6, overflow: "hidden", transition: "border-color 0.15s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "6px 10px", borderBottom: "1px solid var(--c-border)", background: "var(--c-surface-hover)" }}>
        {tbBtn("Bold", () => fmt("bold"), <IconBold />)}
        {tbBtn("Underline", () => fmt("underline"), <IconUnderline />)}
        <div style={{ width: 1, height: 16, background: "var(--c-border)", margin: "0 3px" }} />
        {tbBtn("Heading", () => fmt("formatBlock", "<h3>"), <IconHeading />)}
        {tbBtn("Bullet list", () => fmt("insertUnorderedList"), <IconList />)}
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--c-text-tertiary)" }}>{words} words</span>
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={onInput} onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ minHeight, padding: "14px 16px", fontSize: 14, lineHeight: 1.75, color: "var(--c-text)", outline: "none", fontFamily: "'Inter', sans-serif" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

export default function UPSCEvaluator() {

  /* ── navigation ── */
  const [screen, setScreen] = useState<Screen>("entry");
  const [entryTab, setEntryTab] = useState<EntryTab>("pyq");
  const [resultTab, setResultTab] = useState<ResultTab>("scores");
  const [darkMode, setDarkMode] = useState(true);

  /* ── V3 entry mode ── */
  const [entryMode, setEntryMode] = useState<"upload" | "practice" | null>(null);
  const [sampleExpanded, setSampleExpanded] = useState(false);
  const [showQuestionPicker, setShowQuestionPicker] = useState(false);

  /* ── PYQ ── */
  const [selectedPYQ, setSelectedPYQ] = useState<PYQItem | null>(null);

  /* ── results actions ── */
  const [showSuggestPrompt, setShowSuggestPrompt] = useState(false);

  /* ── editor ── */
  const [editorHtml, setEditorHtml] = useState("");
  const [editorText, setEditorText] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const [writeQuestion, setWriteQuestion] = useState("");

  /* ── PDF ── */
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const pdfRef = useRef<HTMLInputElement>(null);

  /* ── submitted content (persists across screen changes) ── */
  const [submittedText, setSubmittedText] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");

  /* ── loading ── */
  const [loadingStep, setLoadingStep] = useState(-1);
  const [tipIdx, setTipIdx] = useState(0);
  const [loadingSeqPos, setLoadingSeqPos] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

  /* ── results ── */
  const [result, setResult] = useState<EvalResult | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [dimFb, setDimFb] = useState<DimFeedback>({});
  const [errFb, setErrFb] = useState<ErrFeedback>({});

  /* ── feedback modal ── */
  const [showModal, setShowModal] = useState(false);
  const [stars, setStars] = useState(0);
  const [fbNote, setFbNote] = useState("");
  const [shareMsg, setShareMsg] = useState("");

  /* ── loading: real API with mock fallback ── */
  useEffect(() => {
    if (screen !== "loading") return;
    let cancelled = false;

    const delays = [400, 1200, 2400, 3800];
    const timers = delays.map((d, i) => window.setTimeout(() => setLoadingStep(i), d));

    const doFetch = async () => {
      console.log("doFetch called:", { entryTab, entryMode, hasPdf: !!pdfFile, submittedText: submittedText.slice(0, 50), submittedQuestion });
      try {
        let response: Response;

        if (entryTab === "pdf" && pdfFile) {
          const formData = new FormData();
          formData.append("file", pdfFile);
          response = await fetch("https://PranshuT-upsc-answer-evaluator.hf.space/evaluate", {
            method: "POST",
            body: formData,
          });
        } else {
          // Temporary: wrap text as a file for the existing /evaluate endpoint
          const blob = new Blob([submittedText], { type: "text/plain" });
          const textFile = new File([blob], "answer.txt", { type: "text/plain" });
          const formData = new FormData();
          formData.append("file", textFile);
          response = await fetch("https://PranshuT-upsc-answer-evaluator.hf.space/evaluate", {
            method: "POST",
            body: formData,
          });
        }

        if (cancelled) return;

        if (!response.ok) {
          if (response.status === 404 && entryTab !== "pdf") {
            console.warn("evaluate-text not available yet — showing sample result");
          } else {
            console.warn("API returned", response.status, "— using mock result");
          }
          const r: EvalResult = { ...MOCK_RESULT, summary: { ...MOCK_RESULT.summary } };
          setResult(r);
          setAttempts(prev => [...prev, { num: prev.length + 1, percentage: r.percentage, result: r }]);
        } else {
          const apiData = await response.json();
          const mapped = mapApiResponse(apiData);

          if (entryTab === "pdf" && apiData.answers?.[0]?.extractedText) {
            setSubmittedText(apiData.answers[0].extractedText);
          }

          setResult(mapped);
          setAttempts(prev => [...prev, { num: prev.length + 1, percentage: mapped.percentage, result: mapped }]);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Evaluation failed:", err);
        const r: EvalResult = { ...MOCK_RESULT, summary: { ...MOCK_RESULT.summary } };
        setResult(r);
        setAttempts(prev => [...prev, { num: prev.length + 1, percentage: r.percentage, result: r }]);
      }

      if (!cancelled) {
        setLoadingStep(4);
        window.setTimeout(() => {
          setDimFb({});
          setErrFb({});
          setScreen("results");
          setResultTab("scores");
        }, 600);
      }
    };

    doFetch();

    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  /* ── tip rotation ── */
  useEffect(() => {
    if (screen !== "loading") return;
    const id = window.setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 4000);
    return () => window.clearInterval(id);
  }, [screen]);

  /* ── loading card sequence rotation ── */
  useEffect(() => {
    if (screen !== "loading") return;
    const isQuiz = loadingSeqPos % 2 !== 0;
    if (isQuiz && quizAnswered === null) return; // wait for user to tap
    const delay = isQuiz ? 3000 : 5000;
    const timer = window.setTimeout(() => {
      setLoadingSeqPos(p => p + 1);
      setQuizAnswered(null);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [screen, loadingSeqPos, quizAnswered]);

  /* ── helpers ── */
  const canEvaluate =
    entryMode === "upload" ? !!pdfFile :
    entryMode === "practice" ? (writeQuestion.trim().length > 3 && editorText.trim().length > 20) :
    false;

  const pctColor = (p: number) => p >= 75 ? "#448361" : p >= 50 ? "#C29243" : "#D44C47";

  const doEvaluate = () => {
    if (entryMode === "practice") {
      setSubmittedQuestion(writeQuestion);
      setSubmittedText(editorText);
      setEntryTab("write");
    } else {
      setSubmittedQuestion("");
      setSubmittedText("");
      setEntryTab("pdf");
    }
    setLoadingSeqPos(0);
    setQuizAnswered(null);
    setQuizScore({ correct: 0, total: 0 });
    setLoadingStep(-1);
    setScreen("loading");
  };

  const doRetryWrite = () => {
    const q = submittedQuestion || writeQuestion;
    setWriteQuestion(q);
    setEditorKey(k => k + 1);
    setEditorHtml(""); setEditorText("");
    setEntryMode("practice"); setEntryTab("write");
    setShowSuggestPrompt(false);
    setScreen("entry");
  };

  const doNewPDF = () => { setPdfFile(null); setEntryMode("upload"); setEntryTab("pdf"); setScreen("entry"); };

  const doShare = () => {
    if (!result) return;
    navigator.clipboard.writeText(`My UPSC Mains answer scored ${result.percentage}% (${result.overallScore}/${result.maxScore}) — evaluated by UPSCEval.`);
    setShareMsg("Copied!"); setTimeout(() => setShareMsg(""), 2000);
  };

  const doFeedbackSubmit = () => {
    console.log("Feedback:", { stars, note: fbNote, dimFb, errFb });
    setShowModal(false); setStars(0); setFbNote("");
  };

  /* ── theme vars ── */
  const themeStyle = darkMode ? {
    "--c-bg": "#191919", "--c-surface": "#252525", "--c-surface-hover": "#2F2F2F",
    "--c-text": "#E8E8E3", "--c-text-secondary": "#999999", "--c-text-tertiary": "#555555",
    "--c-border": "#333333", "--c-border-hover": "#444444",
    "--c-accent": "#529CCA", "--c-accent-bg": "#1A2940",
    "--c-green": "#4F9768", "--c-green-bg": "#1E2B23",
    "--c-amber": "#C29243", "--c-amber-bg": "#2A2215",
    "--c-red": "#D44C47", "--c-red-bg": "#2E1A1A",
  } as React.CSSProperties : {
    "--c-bg": "#F7F7F5", "--c-surface": "#FFFFFF", "--c-surface-hover": "#F1F1EF",
    "--c-text": "#37352F", "--c-text-secondary": "#787774", "--c-text-tertiary": "#B4B4B0",
    "--c-border": "#E9E9E7", "--c-border-hover": "#D8D8D6",
    "--c-accent": "#2383E2", "--c-accent-bg": "#EAF3FD",
    "--c-green": "#448361", "--c-green-bg": "#EEF3ED",
    "--c-amber": "#C29243", "--c-amber-bg": "#FBF3E3",
    "--c-red": "#D44C47", "--c-red-bg": "#FDEBEA",
  } as React.CSSProperties;

  /* ── global CSS ── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @keyframes upscSpin { to { transform: rotate(360deg); } }
    @keyframes upscFadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
    @keyframes upscSlideIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
    button { cursor: pointer; font-family: inherit; }
    [contenteditable]:empty::before { content: attr(data-placeholder); color: var(--c-text-tertiary); pointer-events: none; }
    [contenteditable] h3 { font-family:'Noto Serif',Georgia,serif; font-size:15px; font-weight:600; margin:10px 0 4px; }
    [contenteditable] ul { padding-left:20px; margin:4px 0; }
    .v3-tab { display:flex; align-items:center; gap:6px; padding:10px 16px; background:transparent; border:none; border-bottom:2px solid transparent; font-size:13px; font-weight:500; color:var(--c-text-secondary); cursor:pointer; transition:color 0.15s, border-color 0.15s; white-space:nowrap; }
    .v3-tab.on { color:var(--c-text); border-bottom-color:var(--c-text); }
    .v3-tab:hover:not(.on) { color:var(--c-text); }
    @media(max-width:600px){ .v3-tab-label{display:none;} .v3-tab{padding:10px 11px;} }
    .v3-chip { padding:4px 12px; border-radius:20px; border:1px solid var(--c-border); background:var(--c-surface); color:var(--c-text-secondary); font-size:12px; font-weight:500; cursor:pointer; transition:all 0.12s; }
    .v3-chip.on { background:var(--c-accent-bg); border-color:var(--c-accent); color:var(--c-accent); }
    .v3-chip:hover:not(.on) { border-color:var(--c-text-tertiary); color:var(--c-text); }
    .v3-fbtn { display:flex; align-items:center; gap:4px; padding:4px 10px; border-radius:4px; border:1px solid var(--c-border); background:transparent; font-size:12px; color:var(--c-text-secondary); cursor:pointer; transition:all 0.12s; }
    .v3-fbtn:hover { border-color:var(--c-text-tertiary); }
    .v3-fbtn.agree { border-color:var(--c-green); color:var(--c-green); background:var(--c-green-bg); }
    .v3-fbtn.disagree { border-color:var(--c-red); color:var(--c-red); background:var(--c-red-bg); }
    .entry-card { text-align:left; padding:18px 18px 16px; border-radius:10px; border:1px solid var(--c-border); background:var(--c-surface); cursor:pointer; transition:border-color 0.15s, background 0.15s; }
    .entry-card:hover { border-color:var(--c-border-hover); }
    .entry-card.active { border-color:var(--c-accent); background:var(--c-accent-bg); }
    .quiz-opt { text-align:left; padding:10px 14px; border-radius:6px; font-size:13px; font-family:inherit; cursor:pointer; transition:all 0.15s; }
    .quiz-opt:disabled { cursor:default; }
  `;

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ ...themeStyle, minHeight: "100vh", background: "var(--c-bg)", color: "var(--c-text)", fontFamily: "'Inter',-apple-system,sans-serif", fontSize: 14 }}>
      <style>{css}</style>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header style={{ borderBottom: "1px solid var(--c-border)", height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, background: "var(--c-bg)", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 5, border: "1px solid var(--c-border)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Serif',serif", fontWeight: 700, fontSize: 13 }}>U</div>
          <span style={{ fontWeight: 600, fontSize: 14 }}>UPSC Evaluator</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {screen !== "entry" && (
            <button onClick={() => setScreen("entry")} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid var(--c-border)", background: "transparent", fontSize: 13, color: "var(--c-text-secondary)", transition: "border-color 0.15s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "var(--c-text-tertiary)"} onMouseLeave={e => e.currentTarget.style.borderColor = "var(--c-border)"}>New answer</button>
          )}
          <button onClick={() => setDarkMode(d => !d)} style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid var(--c-border)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-text-secondary)", transition: "border-color 0.15s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "var(--c-text-tertiary)"} onMouseLeave={e => e.currentTarget.style.borderColor = "var(--c-border)"}>
            {darkMode ? <IconSun /> : <IconMoon />}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>

        {/* ════════════════════════════════════════════════════════════════
            SCREEN 1 — ENTRY
        ════════════════════════════════════════════════════════════════ */}
        {screen === "entry" && (
          <div style={{ animation: "upscFadeIn 0.2s ease", paddingTop: 40, paddingBottom: 64 }}>

            {/* Session warning */}
            {attempts.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 6, background: "var(--c-amber-bg)", border: "1px solid var(--c-amber)", color: "var(--c-amber)", marginBottom: 24, fontSize: 13 }}>
                <span style={{ flexShrink: 0 }}><IconWarning /></span>
                <span style={{ color: "var(--c-text-secondary)" }}>Session active — {attempts.length} attempt(s) recorded. Do not close this tab or your attempt history will be lost.</span>
              </div>
            )}

            {/* Hero */}
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--c-accent)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono',monospace", marginBottom: 10 }}>AI trained on UPSC patterns</p>
              <h1 style={{ fontFamily: "'Noto Serif',Georgia,serif", fontWeight: 700, fontSize: 28, lineHeight: 1.3, marginBottom: 10 }}>Write. Get feedback. Rewrite. Improve.</h1>
              <p style={{ color: "var(--c-text-secondary)", fontSize: 14, lineHeight: 1.65, marginBottom: 16 }}>Scored across 7 dimensions — factual accuracy, structure, current affairs, and more.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {[
                  { dot: "var(--c-green)", label: "7 scoring dimensions" },
                  { dot: "var(--c-accent)", label: "Factual error detection" },
                  { dot: "var(--c-amber)", label: "PYQ bank included" },
                ].map((pill, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, border: "1px solid var(--c-border)", background: "var(--c-surface)", fontSize: 12, color: "var(--c-text-secondary)" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: pill.dot, flexShrink: 0 }} />
                    {pill.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Entry cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 4 }}>
              {/* Upload card */}
              <button
                className={`entry-card${entryMode === "upload" ? " active" : ""}`}
                onClick={() => setEntryMode(entryMode === "upload" ? null : "upload")}
              >
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: entryMode === "upload" ? "var(--c-accent)" : "var(--c-accent-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: entryMode === "upload" ? "#fff" : "var(--c-accent)", marginBottom: 12, transition: "background 0.15s" }}>
                  <IconUpload size={16} />
                </div>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Upload Answer Sheet</p>
                <p style={{ fontSize: 12, color: "var(--c-text-secondary)", lineHeight: 1.5, marginBottom: 10 }}>Evaluate a handwritten or typed PDF answer sheet.</p>
                <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, background: "var(--c-accent-bg)", color: "var(--c-accent)", fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>Reads handwriting</span>
              </button>

              {/* Practice card */}
              <button
                className={`entry-card${entryMode === "practice" ? " active" : ""}`}
                onClick={() => setEntryMode(entryMode === "practice" ? null : "practice")}
              >
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: entryMode === "practice" ? "var(--c-green)" : "var(--c-green-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: entryMode === "practice" ? "#fff" : "var(--c-green)", marginBottom: 12, transition: "background 0.15s" }}>
                  <IconPen size={16} />
                </div>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Practice Here</p>
                <p style={{ fontSize: 12, color: "var(--c-text-secondary)", lineHeight: 1.5, marginBottom: 10 }}>Type your answer in the browser — choose from PYQ bank or write your own question.</p>
                <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, background: "var(--c-green-bg)", color: "var(--c-green)", fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>No PDF needed</span>
              </button>
            </div>

            {/* ── UPLOAD ZONE ── */}
            {entryMode === "upload" && (
              <div style={{ animation: "upscSlideIn 0.15s ease", marginTop: 16, padding: "20px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)" }}>
                <input ref={pdfRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => setPdfFile(e.target.files?.[0] ?? null)} />
                {!pdfFile ? (
                  <div onClick={() => pdfRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={e => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files[0]; if (f?.type === "application/pdf") setPdfFile(f); }}
                    style={{ border: `1.5px dashed ${dragActive ? "var(--c-accent)" : "var(--c-border)"}`, borderRadius: 8, padding: "40px 24px", textAlign: "center", cursor: "pointer", background: dragActive ? "var(--c-accent-bg)" : "var(--c-surface-hover)", transition: "all 0.15s" }}>
                    <div style={{ color: "var(--c-text-tertiary)", display: "flex", justifyContent: "center", marginBottom: 10 }}><IconUpload size={24} /></div>
                    <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>Drop your answer sheet PDF here</p>
                    <p style={{ fontSize: 13, color: "var(--c-text-secondary)" }}>or click to browse</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 8, border: "1px solid var(--c-green)", background: "var(--c-green-bg)" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>{pdfFile.name}</p>
                      <p style={{ fontSize: 12, color: "var(--c-text-secondary)", fontFamily: "'JetBrains Mono',monospace" }}>
                        {pdfFile.size >= 1048576 ? `${(pdfFile.size / 1048576).toFixed(1)} MB` : `${Math.round(pdfFile.size / 1024)} KB`}
                      </p>
                    </div>
                    <button onClick={() => setPdfFile(null)} style={{ padding: 6, borderRadius: 4, border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-text-secondary)", display: "flex", alignItems: "center" }}><IconX /></button>
                  </div>
                )}
              </div>
            )}

            {/* ── PRACTICE EDITOR ── */}
            {entryMode === "practice" && (
              <div style={{ animation: "upscSlideIn 0.15s ease", marginTop: 16, padding: "20px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)" }}>

                {/* Question input + picker */}
                <div style={{ position: "relative", marginBottom: 14 }}>
                  <input type="text" value={writeQuestion} onChange={e => setWriteQuestion(e.target.value)}
                    placeholder="Type your question or pick one below..."
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 6, border: "1px solid var(--c-border)", background: "var(--c-surface-hover)", color: "var(--c-text)", fontSize: 14, outline: "none", fontFamily: "inherit", transition: "border-color 0.15s" }}
                    onFocus={e => e.target.style.borderColor = "var(--c-accent)"}
                    onBlur={e => e.target.style.borderColor = "var(--c-border)"} />

                  {/* Browse link */}
                  <button
                    onClick={() => setShowQuestionPicker(p => !p)}
                    style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, background: "none", border: "none", fontSize: 12, color: "var(--c-text-tertiary)", cursor: "pointer", padding: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--c-text-secondary)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--c-text-tertiary)"}
                  >
                    Browse sample questions
                    <span style={{ display: "inline-flex", transform: showQuestionPicker ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
                      <IconChevronDown size={11} />
                    </span>
                  </button>

                  {/* Dropdown */}
                  {showQuestionPicker && (
                    <>
                      <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setShowQuestionPicker(false)} />
                      <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 20, border: "1px solid var(--c-border)", background: "var(--c-surface)", borderRadius: 8, maxHeight: 300, overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.12)" }}>
                        {FLAT_PYQ.map((item, i) => (
                          <button
                            key={item.id}
                            onClick={() => { setWriteQuestion(item.q); setSelectedPYQ({ id: item.id, q: item.q, marks: item.marks }); setShowQuestionPicker(false); }}
                            style={{ width: "100%", textAlign: "left", padding: "10px 14px", background: "transparent", border: "none", borderBottom: i < FLAT_PYQ.length - 1 ? "1px solid var(--c-border)" : "none", cursor: "pointer", display: "flex", gap: 10, alignItems: "flex-start" }}
                            onMouseEnter={e => e.currentTarget.style.background = "var(--c-surface-hover)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          >
                            <span style={{ flexShrink: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 3, background: "var(--c-accent-bg)", color: "var(--c-accent)", marginTop: 1 }}>{item.paper}</span>
                            <span style={{ fontSize: 13, lineHeight: 1.5, color: "var(--c-text)", flex: 1 }}>{item.q}</span>
                            <span style={{ flexShrink: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 3, background: "var(--c-surface-hover)", border: "1px solid var(--c-border)", color: "var(--c-text-secondary)", marginTop: 1 }}>{item.marks}m</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Editor — always visible */}
                <NotionEditor key={`practice-${editorKey}`} onChange={(h, t) => { setEditorHtml(h); setEditorText(t); }} placeholder="Write your answer here..." />
              </div>
            )}

            {/* Evaluate button */}
            {entryMode !== null && (
              <div style={{ marginTop: 20 }}>
                <button onClick={doEvaluate} disabled={!canEvaluate}
                  style={{ width: "100%", padding: "11px 24px", borderRadius: 6, border: "none", background: canEvaluate ? "var(--c-text)" : "var(--c-border)", color: canEvaluate ? "var(--c-bg)" : "var(--c-text-tertiary)", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: canEvaluate ? "pointer" : "not-allowed", transition: "background 0.15s, color 0.15s" }}>
                  Evaluate My Answer <IconArrowRight />
                </button>
                <p style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "var(--c-text-tertiary)" }}>Free. No signup. No limits.</p>
              </div>
            )}

            {/* Sample evaluation preview */}
            <div style={{ marginTop: 36, border: "1px solid var(--c-border)", borderRadius: 10, background: "var(--c-surface)", overflow: "hidden" }}>
              <button
                onClick={() => setSampleExpanded(e => !e)}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer", borderBottom: sampleExpanded ? "1px solid var(--c-border)" : "none", transition: "background 0.12s" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--c-surface-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>See a sample evaluation</p>
                  <p style={{ fontSize: 12, color: "var(--c-text-secondary)" }}>GS2 — Governor's role · 54% · 7 dimensions scored</p>
                </div>
                <span style={{ color: "var(--c-text-tertiary)", display: "flex", alignItems: "center", transform: sampleExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                  <IconChevronDown />
                </span>
              </button>
              {sampleExpanded && (
                <div style={{ padding: "18px 20px", animation: "upscSlideIn 0.15s ease" }}>
                  <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 16 }}>
                    <ScoreRing score={MOCK_RESULT.overallScore} max={MOCK_RESULT.maxScore} size={76} />
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{MOCK_RESULT.overallScore} / {MOCK_RESULT.maxScore} · {MOCK_RESULT.percentage}%</p>
                      <p style={{ fontSize: 12, color: "var(--c-text-secondary)", lineHeight: 1.55 }}>{MOCK_RESULT.examinerVerdict.slice(0, 140)}…</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {MOCK_RESULT.dimensions.slice(0, 4).map((dim, i) => {
                      const pct = (dim.score / dim.max) * 100;
                      return (
                        <div key={i}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 0 }}>
                            <span style={{ fontSize: 12, color: "var(--c-text-secondary)" }}>{dim.name}</span>
                            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, color: pctColor(pct) }}>{dim.score}/{dim.max}</span>
                          </div>
                          <ScoreBar pct={pct} color={pctColor(pct)} delay={i * 60} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* How it works */}
            <div style={{ marginTop: 36 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono',monospace", marginBottom: 18 }}>How it works</p>
              {[
                { n: "1", title: "Write or upload", desc: "Type your answer directly in the browser, or upload a handwritten or typed PDF answer sheet." },
                { n: "2", title: "AI evaluates in seconds", desc: "Scored against 7 UPSC-specific dimensions including factual accuracy, structure, and current affairs integration." },
                { n: "3", title: "Improve and retry", desc: "Get specific corrections, targeted improvements, and retry immediately — track your progress across attempts." },
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: i < 2 ? 18 : 0 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--c-accent)", background: "var(--c-accent-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, color: "var(--c-accent)", flexShrink: 0 }}>{step.n}</div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{step.title}</p>
                    <p style={{ fontSize: 13, color: "var(--c-text-secondary)", lineHeight: 1.55 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            SCREEN 2 — LOADING
        ════════════════════════════════════════════════════════════════ */}
        {screen === "loading" && (
          <div style={{ animation: "upscFadeIn 0.2s ease", paddingTop: 64, paddingBottom: 48, maxWidth: 480, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "'Noto Serif',Georgia,serif", fontWeight: 600, fontSize: 22, textAlign: "center", marginBottom: 32 }}>Evaluating your answer</h2>

            {/* Step checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
              {([
                entryTab === "pdf" ? "Extracting text from PDF..." : "Processing your answer...",
                "Identifying question-answer pairs...",
                "Evaluating content and structure...",
                "Calibrating scores...",
              ]).map((step, i) => {
                const done = loadingStep > i;
                const active = loadingStep === i;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, opacity: done || active ? 1 : 0.38, transition: "opacity 0.3s ease" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${done ? "var(--c-green)" : active ? "var(--c-accent)" : "var(--c-border)"}`, background: done ? "var(--c-green-bg)" : active ? "var(--c-accent-bg)" : "transparent", color: done ? "var(--c-green)" : active ? "var(--c-accent)" : "var(--c-text-tertiary)" }}>
                      {done ? <IconCheck /> : active ? <IconSpinner /> : <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>{i + 1}</span>}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: active ? 500 : 400, color: done ? "var(--c-green)" : active ? "var(--c-text)" : "var(--c-text-secondary)" }}>{step}</span>
                  </div>
                );
              })}
            </div>

            {/* Evaluator tip */}
            <div style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface-hover)", marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'JetBrains Mono',monospace", marginBottom: 5 }}>Evaluator Tip</p>
              <p style={{ fontSize: 12, color: "var(--c-text-secondary)", lineHeight: 1.65 }}>{TIPS[tipIdx]}</p>
            </div>

            {/* Alternating Did You Know / Quiz card */}
            {loadingSeqPos % 2 === 0 ? (
              /* ── DID YOU KNOW card ── */
              <div key={`fact-${loadingSeqPos}`} style={{ animation: "upscFadeIn 0.3s ease", border: "1px solid var(--c-border)", borderRadius: 10, background: "var(--c-surface)", padding: "20px 22px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-accent)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono',monospace", marginBottom: 14 }}>Did You Know</p>
                <p style={{ fontFamily: "'Noto Serif',Georgia,serif", fontSize: 24, fontWeight: 700, color: "var(--c-text)", lineHeight: 1.2, marginBottom: 10 }}>
                  {DID_YOU_KNOW[Math.floor(loadingSeqPos / 2) % DID_YOU_KNOW.length].big}
                </p>
                <p style={{ fontSize: 13, color: "var(--c-text-secondary)", lineHeight: 1.7, marginBottom: 14 }}>
                  {DID_YOU_KNOW[Math.floor(loadingSeqPos / 2) % DID_YOU_KNOW.length].fact}
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {DID_YOU_KNOW[Math.floor(loadingSeqPos / 2) % DID_YOU_KNOW.length].tags.map((tag, i) => (
                    <span key={i} style={{ padding: "2px 8px", borderRadius: 4, background: "var(--c-accent-bg)", color: "var(--c-accent)", fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>{tag}</span>
                  ))}
                </div>
              </div>
            ) : (
              /* ── QUIZ card ── */
              (() => {
                const qIdx = Math.floor((loadingSeqPos - 1) / 2) % QUIZ_QUESTIONS.length;
                const q = QUIZ_QUESTIONS[qIdx];
                return (
                  <div key={`quiz-${loadingSeqPos}`} style={{ animation: "upscFadeIn 0.3s ease", border: "1px solid var(--c-border)", borderRadius: 10, background: "var(--c-surface)", padding: "20px 22px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-amber)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono',monospace" }}>Quick Quiz</p>
                      {quizScore.total > 0 && (
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "var(--c-text-tertiary)" }}>{quizScore.correct}/{quizScore.total} correct</span>
                      )}
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--c-text)", lineHeight: 1.6, marginBottom: 14 }}>{q.question}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {q.options.map((opt, i) => {
                        let bg = "var(--c-surface-hover)", borderColor = "var(--c-border)", color = "var(--c-text)";
                        if (quizAnswered !== null) {
                          if (i === q.correct) { bg = "var(--c-green-bg)"; borderColor = "var(--c-green)"; color = "var(--c-green)"; }
                          else if (i === quizAnswered) { bg = "var(--c-red-bg)"; borderColor = "var(--c-red)"; color = "var(--c-red)"; }
                        }
                        return (
                          <button key={i} className="quiz-opt" disabled={quizAnswered !== null}
                            onClick={() => {
                              if (quizAnswered !== null) return;
                              setQuizAnswered(i);
                              setQuizScore(s => ({ correct: s.correct + (i === q.correct ? 1 : 0), total: s.total + 1 }));
                            }}
                            style={{ background: bg, border: `1px solid ${borderColor}`, color }}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {quizAnswered !== null && (
                      <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 6, background: "var(--c-accent-bg)", borderLeft: "3px solid var(--c-accent)", animation: "upscSlideIn 0.15s ease" }}>
                        <p style={{ fontSize: 12, color: "var(--c-text-secondary)", lineHeight: 1.65 }}>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            SCREEN 3 — RESULTS
        ════════════════════════════════════════════════════════════════ */}
        {screen === "results" && result && (
          <div style={{ animation: "upscFadeIn 0.2s ease", paddingTop: 28, paddingBottom: 64 }}>

            {/* Attempt history */}
            {attempts.length > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "var(--c-text-tertiary)", marginRight: 2 }}>Attempts:</span>
                {attempts.map((att, i) => {
                  const delta = i > 0 ? att.percentage - attempts[i - 1].percentage : null;
                  const last = i === attempts.length - 1;
                  return (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, border: `1px solid ${last ? "var(--c-accent)" : "var(--c-border)"}`, background: last ? "var(--c-accent-bg)" : "var(--c-surface)", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: last ? "var(--c-accent)" : "var(--c-text-secondary)" }}>
                      #{att.num} {att.percentage}%
                      {delta !== null && <span style={{ color: delta >= 0 ? "var(--c-green)" : "var(--c-red)", fontWeight: 700, fontSize: 11 }}>{delta >= 0 ? `+${delta}` : delta}%</span>}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Summary banner */}
            <div style={{ border: "1px solid var(--c-border)", borderRadius: 10, background: "var(--c-surface)", padding: 24, marginBottom: 14, display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
              <ScoreRing score={result.overallScore} max={result.maxScore} size={96} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{result.overallScore} / {result.maxScore} · {result.percentage}%</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                  {result.summary.strengths.map((s, i) => <span key={i} style={{ padding: "2px 8px", borderRadius: 4, fontSize: 12, background: "var(--c-green-bg)", color: "var(--c-green)", fontWeight: 500 }}>{s}</span>)}
                  {result.summary.weaknesses.map((w, i) => <span key={i} style={{ padding: "2px 8px", borderRadius: 4, fontSize: 12, background: "var(--c-red-bg)", color: "var(--c-red)", fontWeight: 500 }}>{w}</span>)}
                </div>
                <div style={{ padding: "10px 14px", borderRadius: 6, background: "var(--c-accent-bg)", borderLeft: "3px solid var(--c-accent)" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Top Priority</p>
                  <p style={{ fontSize: 13, color: "var(--c-text-secondary)", lineHeight: 1.55 }}>{result.summary.topRecommendation}</p>
                </div>
              </div>
            </div>

            {/* Meta badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4, background: "var(--c-amber-bg)", color: "var(--c-amber)", border: "1px solid var(--c-amber)", letterSpacing: "0.05em" }}>{result.directive}</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, padding: "3px 10px", borderRadius: 4, background: "var(--c-accent-bg)", color: "var(--c-accent)", border: "1px solid var(--c-accent)" }}>{result.syllabusTag}</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, padding: "3px 10px", borderRadius: 4, background: "var(--c-surface-hover)", color: "var(--c-text-secondary)", border: "1px solid var(--c-border)" }}>{result.wordCount} words</span>
            </div>

            {/* Examiner verdict */}
            <div style={{ borderLeft: "3px solid var(--c-amber)", padding: "14px 18px", background: "var(--c-amber-bg)", borderRadius: "0 8px 8px 0", border: "1px solid var(--c-border)", borderLeftColor: "var(--c-amber)", marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-amber)", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono',monospace", marginBottom: 8 }}>Examiner's Verdict</p>
              <p style={{ fontFamily: "'Noto Serif',Georgia,serif", fontSize: 14, fontStyle: "italic", lineHeight: 1.75, color: "var(--c-text)" }}>{result.examinerVerdict}</p>
            </div>

            {/* Result tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--c-border)", marginBottom: 16 }}>
              {([{ id: "scores" as ResultTab, label: "Scores" }, { id: "errors" as ResultTab, label: `Errors (${result.factualErrors.length})` }, { id: "improve" as ResultTab, label: `Improve (${result.improvements.length})` }, { id: "text" as ResultTab, label: "Your Text" }]).map(t => (
                <button key={t.id} className={`v3-tab${resultTab === t.id ? " on" : ""}`} onClick={() => setResultTab(t.id)}>
                  <span className="v3-tab-label">{t.label}</span>
                </button>
              ))}
            </div>

            {/* ── SCORES ── */}
            {resultTab === "scores" && (
              <div style={{ animation: "upscSlideIn 0.15s ease" }}>
                {result.dimensions.map((dim, i) => {
                  const pct = (dim.score / dim.max) * 100;
                  const col = pctColor(pct);
                  const fb = dimFb[dim.name];
                  return (
                    <div key={i} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: i < result.dimensions.length - 1 ? "1px solid var(--c-border)" : "none" }}>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 2 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{dim.name}</span>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, padding: "1px 6px", borderRadius: 3, background: "var(--c-surface-hover)", border: "1px solid var(--c-border)", color: "var(--c-text-secondary)" }}>{dim.weight}</span>
                        </div>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: col }}>{dim.score}/{dim.max}</span>
                      </div>
                      <ScoreBar pct={pct} color={col} delay={i * 80} />
                      <p style={{ fontSize: 12, color: "var(--c-text-secondary)", lineHeight: 1.55, marginBottom: 10 }}>{dim.comment}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: "var(--c-text-tertiary)" }}>Agree with this score?</span>
                        <button className={`v3-fbtn${fb === "agree" ? " agree" : ""}`} onClick={() => setDimFb(p => ({ ...p, [dim.name]: "agree" }))}>
                          <IconThumbUp size={12} filled={fb === "agree"} /> Yes
                        </button>
                        <button className={`v3-fbtn${fb === "disagree" ? " disagree" : ""}`} onClick={() => setDimFb(p => ({ ...p, [dim.name]: "disagree" }))}>
                          <IconThumbDown size={12} filled={fb === "disagree"} /> No
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── ERRORS ── */}
            {resultTab === "errors" && (
              <div style={{ animation: "upscSlideIn 0.15s ease", display: "flex", flexDirection: "column", gap: 10 }}>
                {result.factualErrors.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", border: "1px solid var(--c-green)", borderRadius: 8, background: "var(--c-green-bg)" }}>
                    <div style={{ color: "var(--c-green)", display: "flex", justifyContent: "center", marginBottom: 8 }}><IconCheck size={20} /></div>
                    <p style={{ fontWeight: 500, color: "var(--c-green)" }}>No factual errors detected</p>
                  </div>
                ) : result.factualErrors.map((err, i) => {
                  const sc = err.severity === "critical" ? "var(--c-red)" : err.severity === "moderate" ? "var(--c-amber)" : "var(--c-text-tertiary)";
                  const fb = errFb[i];
                  return (
                    <div key={i} style={{ borderRadius: 8, border: "1px solid var(--c-border)", borderLeft: `3px solid ${sc}`, overflow: "hidden" }}>
                      <div style={{ padding: "12px 16px", background: "var(--c-surface)" }}>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, color: sc, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>{err.severity}</span>
                        <p style={{ fontFamily: "'Noto Serif',Georgia,serif", fontStyle: "italic", fontSize: 13, color: "var(--c-red)", lineHeight: 1.6, padding: "8px 12px", background: "var(--c-red-bg)", borderRadius: 4, marginBottom: 8 }}>"{err.errorText}"</p>
                        <p style={{ fontSize: 12, color: "var(--c-text-secondary)", lineHeight: 1.55, marginBottom: 10 }}>{err.whatIsWrong}</p>
                        <div style={{ padding: "10px 12px", background: "var(--c-green-bg)", borderRadius: 4, marginBottom: 12 }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-green)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'JetBrains Mono',monospace" }}>Correction</p>
                          <p style={{ fontSize: 13, color: "var(--c-text)", lineHeight: 1.55 }}>{err.correction}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 12, color: "var(--c-text-tertiary)" }}>Is this error correct?</span>
                          <button className={`v3-fbtn${fb === "correct" ? " agree" : ""}`} onClick={() => setErrFb(p => ({ ...p, [i]: "correct" }))}>Yes, it's wrong</button>
                          <button className={`v3-fbtn${fb === "wrong" ? " disagree" : ""}`} onClick={() => setErrFb(p => ({ ...p, [i]: "wrong" }))}>AI is wrong here</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── IMPROVE ── */}
            {resultTab === "improve" && (
              <div style={{ animation: "upscSlideIn 0.15s ease", display: "flex", flexDirection: "column", gap: 8 }}>
                {result.improvements.map((imp, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", transition: "background 0.12s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--c-surface-hover)"}
                    onMouseLeave={e => e.currentTarget.style.background = "var(--c-surface)"}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: "var(--c-accent-bg)", color: "var(--c-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>{i + 1}</div>
                    <p style={{ fontSize: 13, color: "var(--c-text)", lineHeight: 1.6 }}>{imp}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── YOUR TEXT ── */}
            {resultTab === "text" && (
              <div style={{ animation: "upscSlideIn 0.15s ease", padding: 16, borderRadius: 8, background: "var(--c-surface)", border: "1px solid var(--c-border)" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12, fontFamily: "'JetBrains Mono',monospace" }}>Submitted Text</p>
                <p style={{ fontFamily: "'JetBrains Mono',Menlo,monospace", fontSize: 12, lineHeight: 1.85, color: "var(--c-text-secondary)", whiteSpace: "pre-wrap" }}>
                  {submittedText || (result as EvalResult & { extractedText?: string })?.extractedText || "[No text available]"}
                </p>
              </div>
            )}

            {/* Minimal text action row */}
            <div style={{ marginTop: 28, display: "flex", alignItems: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => setShowSuggestPrompt(p => !p)}
                style={{ background: "none", border: "none", fontSize: 13, color: "var(--c-text-secondary)", cursor: "pointer", padding: "4px 0" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--c-text)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--c-text-secondary)"}>
                See Suggested Answer
              </button>
              <span style={{ color: "var(--c-text-tertiary)", margin: "0 10px", userSelect: "none" }}>·</span>
              <button
                onClick={() => setShowModal(true)}
                style={{ background: "none", border: "none", fontSize: 13, color: "var(--c-text-secondary)", cursor: "pointer", padding: "4px 0" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--c-text)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--c-text-secondary)"}>
                Rate
              </button>
              <span style={{ color: "var(--c-text-tertiary)", margin: "0 10px", userSelect: "none" }}>·</span>
              <button
                onClick={doShare}
                style={{ background: "none", border: "none", fontSize: 13, color: "var(--c-text-secondary)", cursor: "pointer", padding: "4px 0" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--c-text)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--c-text-secondary)"}>
                {shareMsg || "Share"}
              </button>
            </div>

            {/* Inline suggest prompt */}
            {showSuggestPrompt && (
              <div style={{ marginTop: 14, padding: "14px 16px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", animation: "upscSlideIn 0.15s ease" }}>
                <p style={{ fontSize: 13, color: "var(--c-text)", lineHeight: 1.65, marginBottom: 12 }}>Want to try rewriting yourself first? You'll improve more by trying.</p>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  <button
                    onClick={doRetryWrite}
                    style={{ background: "none", border: "none", fontSize: 13, color: "var(--c-accent)", cursor: "pointer", padding: 0, display: "inline-flex", alignItems: "center", gap: 4 }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                    Let me try first <IconArrowRight size={12} />
                  </button>
                  <button
                    onClick={() => { console.log("TODO: generate suggested answer"); }}
                    style={{ background: "none", border: "none", fontSize: 13, color: "var(--c-text-secondary)", cursor: "pointer", padding: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--c-text)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--c-text-secondary)"}>
                    Show suggested version
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* ── FEEDBACK MODAL ── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "0 24px" }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ width: "100%", maxWidth: 420, borderRadius: 12, border: "1px solid var(--c-border)", background: "var(--c-surface)", padding: 28, animation: "upscSlideIn 0.15s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Noto Serif',Georgia,serif", fontWeight: 600, fontSize: 17 }}>How accurate was this evaluation?</h3>
              <button onClick={() => setShowModal(false)} style={{ padding: 4, border: "none", background: "transparent", color: "var(--c-text-secondary)", cursor: "pointer", marginLeft: 8 }}><IconX size={16} /></button>
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setStars(n)} style={{ padding: 4, border: "none", background: "transparent", color: n <= stars ? "var(--c-amber)" : "var(--c-border)", cursor: "pointer", transition: "color 0.1s" }}>
                  <IconStar size={24} filled={n <= stars} />
                </button>
              ))}
            </div>
            <textarea value={fbNote} onChange={e => setFbNote(e.target.value)}
              placeholder="Optional: any comments on the evaluation..."
              rows={3}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid var(--c-border)", background: "var(--c-surface-hover)", color: "var(--c-text)", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", marginBottom: 16, transition: "border-color 0.15s" }}
              onFocus={e => e.target.style.borderColor = "var(--c-accent)"}
              onBlur={e => e.target.style.borderColor = "var(--c-border)"} />
            <button onClick={doFeedbackSubmit} disabled={stars === 0}
              style={{ width: "100%", padding: "10px", borderRadius: 6, border: "none", background: stars > 0 ? "var(--c-text)" : "var(--c-border)", color: stars > 0 ? "var(--c-bg)" : "var(--c-text-tertiary)", fontSize: 14, fontWeight: 600, cursor: stars > 0 ? "pointer" : "not-allowed" }}>
              Submit Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
