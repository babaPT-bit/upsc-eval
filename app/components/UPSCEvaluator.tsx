"use client";
import React, { useState, useRef, useEffect } from "react";
import { track } from '@vercel/analytics';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _rawEvaluation?: any;
}
interface Attempt { num: number; percentage: number; result: EvalResult; }
type DimFeedback = Record<string, "agree" | "disagree">;
type ErrFeedback = Record<number, "correct" | "wrong">;

/* ═══════════════════════════════════════════════════════════════════════════
   API RESPONSE MAPPER
═══════════════════════════════════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiResponse(apiData: any): EvalResult {
  if (!apiData.answers || apiData.answers.length === 0) return MOCK_RESULT;
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
    _rawEvaluation: answer.evaluation || {},
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
function IconBrain({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}
function IconBarChart({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
function IconTrendingUp({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUGGESTED ANSWER RENDERER
═══════════════════════════════════════════════════════════════════════════ */

function renderSuggestedAnswer(text: string) {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, i) => {
    let trimmed = line.trim();
    if (!trimmed) return <div key={i} style={{ height: 6 }} />;

    // Detect marker type
    const isImproved = /\[IMPROVED[^\]]*\]/.test(trimmed);
    const isAdded = /\[ADDED[^\]]*\]/.test(trimmed);

    // Strip all markers
    let clean = trimmed
      .replace(/\[IMPROVED[^\]]*\]/g, '')
      .replace(/\[ADDED[^\]]*\]/g, '')
      .replace(/\[UNCHANGED[^\]]*\]/g, '')
      .trim();

    // Strip markdown: **bold**, ## headings, # headings
    const isHeading = /^#{1,3}\s/.test(clean);
    clean = clean.replace(/^#{1,3}\s*/, '');
    clean = clean.replace(/\*\*(.*?)\*\*/g, '$1');
    clean = clean.replace(/^\*\s/, '• ');

    if (!clean) return null;

    // Heading style
    if (isHeading) {
      const borderColor = isAdded ? 'var(--c-accent)' : isImproved ? 'var(--c-green)' : 'var(--c-text-secondary)';
      const bg = isAdded ? 'var(--c-accent-bg)' : isImproved ? 'var(--c-green-bg)' : 'transparent';
      return (
        <div key={i} style={{ padding: '8px 12px', marginTop: 12, marginBottom: 4, borderLeft: `3px solid ${borderColor}`, background: bg, borderRadius: '0 4px 4px 0' }}>
          <p style={{ fontSize: 14, fontWeight: 600, fontFamily: "'Noto Serif', Georgia, serif", color: 'var(--c-text)' }}>{clean}</p>
        </div>
      );
    }

    // Improved line
    if (isImproved) {
      return (
        <div key={i} style={{ borderLeft: '3px solid var(--c-green)', background: 'var(--c-green-bg)', padding: '6px 12px', borderRadius: '0 4px 4px 0', marginBottom: 3 }}>
          <p style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--c-text)' }}>{clean}</p>
        </div>
      );
    }

    // Added line
    if (isAdded) {
      return (
        <div key={i} style={{ borderLeft: '3px solid var(--c-accent)', background: 'var(--c-accent-bg)', padding: '6px 12px', borderRadius: '0 4px 4px 0', marginBottom: 3 }}>
          <p style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--c-text)' }}>{clean}</p>
        </div>
      );
    }

    // Unchanged line — normal style
    return (
      <p key={i} style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--c-text-secondary)', marginBottom: 3, paddingLeft: 12 }}>{clean}</p>
    );
  });
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
   DIFF HELPERS
═══════════════════════════════════════════════════════════════════════════ */

interface DiffItem {
  original_text: string;
  suggested_text: string;
  diff_type: "replace" | "weakness";
  dimension: string;
  reason: string;
}

function buildDiffsFromResult(result: EvalResult): DiffItem[] {
  const diffs: DiffItem[] = [];

  // 1. Factual errors → direct replace diffs
  for (const err of result.factualErrors) {
    if (err.errorText && err.correction) {
      diffs.push({
        original_text: err.errorText,
        suggested_text: err.correction,
        diff_type: "replace",
        dimension: "Factual Accuracy",
        reason: err.whatIsWrong || "Factual correction needed",
      });
    }
  }

  // 2. Weak dimensions with anchor_text → weakness diffs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const evalData: any = result._rawEvaluation || {};
  const dimKeys = [
    { key: "question_comprehension", name: "Question Comprehension" },
    { key: "syllabus_alignment", name: "Syllabus Alignment" },
    { key: "answer_structure", name: "Answer Structure" },
    { key: "current_affairs", name: "Current Affairs" },
    { key: "presentation", name: "Presentation" },
  ];

  for (const { key, name } of dimKeys) {
    const dimData = evalData[key];
    if (dimData && typeof dimData === "object" && dimData.score < 6) {
      if (dimData.anchor_text && dimData.anchor_type === "weakness") {
        const matchingTip = result.improvements.find(imp =>
          imp.toLowerCase().includes(key.split("_")[0]) ||
          imp.toLowerCase().includes(name.toLowerCase().split(" ")[0])
        );
        diffs.push({
          original_text: dimData.anchor_text,
          suggested_text: matchingTip || dimData.comment || `Improve ${name}`,
          diff_type: "weakness",
          dimension: name,
          reason: dimData.comment || "",
        });
      }

      if (key === "answer_structure") {
        if (!dimData.has_way_forward) {
          const lastSentence = findLastSentence(result);
          if (lastSentence) {
            diffs.push({
              original_text: lastSentence,
              suggested_text: "Add a Way Forward section here with specific, named reform recommendations (e.g., Sarkaria/Punchhi Commission recommendations).",
              diff_type: "weakness",
              dimension: "Answer Structure",
              reason: "Missing 'way forward' — UPSC rewards forward-looking conclusions",
            });
          }
        }
        if (dimData.conclusion_quality === "generic" && dimData.has_conclusion) {
          diffs.push({
            original_text: "generic conclusion detected",
            suggested_text: "Replace with a specific conclusion citing named reforms, committee recommendations, or policy actions.",
            diff_type: "weakness",
            dimension: "Answer Structure",
            reason: "Generic conclusions like 'balanced approach is needed' lose marks",
          });
        }
      }

      if (key === "syllabus_alignment" && dimData.depth_markers_missing) {
        const missing = dimData.depth_markers_missing;
        if (Array.isArray(missing) && missing.length > 0) {
          diffs.push({
            original_text: dimData.anchor_text || "(insufficient depth)",
            suggested_text: `Add specific references: ${missing.slice(0, 3).join(", ")}`,
            diff_type: "weakness",
            dimension: "Syllabus Alignment",
            reason: "Adding specific Articles, cases, and committee references shifts your answer from general awareness to studied depth",
          });
        }
      }
    }
  }

  // Deduplicate by original_text
  const seen = new Set<string>();
  return diffs.filter(d => {
    const k = d.original_text.toLowerCase().trim();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 5);
}

function findLastSentence(result: EvalResult): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const text = (result as any).extractedText || "";
  const sentences = text.split(/[.!?]+/).filter((s: string) => s.trim().length > 10);
  return sentences.length > 0 ? sentences[sentences.length - 1].trim() + "." : "";
}

function renderHighlightedText(text: string, diffs: DiffItem[]) {
  if (!text || !diffs.length) return <span>{text}</span>;

  const lowerText = text.toLowerCase();
  const highlights: Array<{ start: number; end: number; color: string; label: string }> = [];

  for (const diff of diffs) {
    if (!diff.original_text || diff.original_text.length < 5) continue;
    const needle = diff.original_text.toLowerCase().trim();
    const idx = lowerText.indexOf(needle);
    if (idx !== -1) {
      highlights.push({
        start: idx,
        end: idx + diff.original_text.length,
        color: diff.diff_type === "replace" ? "var(--c-red-bg)" : "var(--c-amber-bg)",
        label: diff.dimension,
      });
    }
  }

  highlights.sort((a, b) => a.start - b.start);

  // Remove overlaps
  const clean: typeof highlights = [];
  for (const h of highlights) {
    if (clean.length === 0 || h.start >= clean[clean.length - 1].end) clean.push(h);
  }

  if (clean.length === 0) return <span>{text}</span>;

  const parts: React.ReactNode[] = [];
  let pos = 0;
  for (const h of clean) {
    if (h.start > pos) parts.push(<span key={`t${pos}`}>{text.slice(pos, h.start)}</span>);
    parts.push(
      <span key={`h${h.start}`} title={h.label} style={{
        background: h.color, borderRadius: 3, padding: "1px 3px",
        borderBottom: `2px solid ${h.color === "var(--c-red-bg)" ? "var(--c-red)" : "var(--c-amber)"}`,
      }}>
        {text.slice(h.start, h.end)}
      </span>
    );
    pos = h.end;
  }
  if (pos < text.length) parts.push(<span key={`t${pos}`}>{text.slice(pos)}</span>);
  return <>{parts}</>;
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
  const [showQuestionPicker, setShowQuestionPicker] = useState(false);

  /* ── PYQ ── */
  const [selectedPYQ, setSelectedPYQ] = useState<PYQItem | null>(null);

  /* ── results actions ── */
  const [showSuggestPrompt, setShowSuggestPrompt] = useState(false);
  const [suggestedAnswer, setSuggestedAnswer] = useState<string | null>(null);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [showSuggestedView, setShowSuggestedView] = useState(false);

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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dykIndex, setDykIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

  /* ── streaming ── */
  const [streamTotal, setStreamTotal] = useState(0);
  const [streamCurrent, setStreamCurrent] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [streamedResults, setStreamedResults] = useState<any[]>([]);
  const cancelledRef = useRef(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  /* ── results ── */
  const [result, setResult] = useState<EvalResult | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [dimFb, setDimFb] = useState<DimFeedback>({});
  const [errFb, setErrFb] = useState<ErrFeedback>({});

  /* ── feedback modal ── */
  const [shareMsg, setShareMsg] = useState("");

  /* ── loading: real API with streaming for PDF, direct for text ── */
  useEffect(() => {
    if (screen !== "loading") return;
    cancelledRef.current = false;

    const delays = [400, 1200, 2400, 3800];
    const timers = delays.map((d, i) => window.setTimeout(() => setLoadingStep(i), d));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finishWithMock = () => {
      const r: EvalResult = { ...MOCK_RESULT, summary: { ...MOCK_RESULT.summary } };
      setResult(r);
      setAttempts(prev => [...prev, { num: prev.length + 1, percentage: r.percentage, result: r }]);
      setLoadingStep(4);
      window.setTimeout(() => {
        if (!cancelledRef.current) {
          setDimFb({});
          setErrFb({});
          setScreen("results");
          setResultTab("scores");
          track('evaluate_completed', { percentage: r.percentage, mode: entryTab });
        }
      }, 600);
    };

    const doFetch = async () => {
      try {
        if (entryTab === "pdf" && pdfFile) {
          // ── PDF: regular POST to /evaluate ──
          const formData = new FormData();
          formData.append("file", pdfFile);

          const response = await fetch("https://PranshuT-upsc-answer-evaluator.hf.space/evaluate", {
            method: "POST",
            body: formData,
          });

          if (cancelledRef.current) return;

          if (!response.ok) {
            console.warn("API returned", response.status);
            setEvaluationError(`${response.status}`);
          } else {
            const apiData = await response.json();
            if (apiData.answers?.[0]?.extractedText) {
              setSubmittedText(apiData.answers[0].extractedText);
            }
            const mapped = mapApiResponse(apiData);
            setResult(mapped);
            setAttempts(prev => [...prev, { num: prev.length + 1, percentage: mapped.percentage, result: mapped }]);
            setLoadingStep(4);
            window.setTimeout(() => {
              if (!cancelledRef.current) {
                setDimFb({});
                setErrFb({});
                setScreen("results");
                setResultTab("scores");
                track('evaluate_completed', { percentage: mapped.percentage, mode: entryTab });
              }
            }, 600);
          }

        } else {
          // ── NON-STREAMING: text evaluation ──
          const response = await fetch("https://PranshuT-upsc-answer-evaluator.hf.space/evaluate-text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: submittedText, question: submittedQuestion }),
          });

          if (cancelledRef.current) return;

          if (!response.ok) {
            console.warn("API returned", response.status);
            setEvaluationError(`${response.status}`);
          } else {
            const apiData = await response.json();
            const mapped = mapApiResponse(apiData);
            setResult(mapped);
            setAttempts(prev => [...prev, { num: prev.length + 1, percentage: mapped.percentage, result: mapped }]);
            setLoadingStep(4);
            window.setTimeout(() => {
              if (!cancelledRef.current) {
                setDimFb({});
                setErrFb({});
                setScreen("results");
                setResultTab("scores");
                track('evaluate_completed', { percentage: mapped.percentage, mode: entryTab });
              }
            }, 600);
          }
        }
      } catch (err) {
        if (cancelledRef.current) return;
        console.error("Evaluation failed:", err);
        setEvaluationError("fetch_error");
      }
    };

    doFetch();

    return () => {
      cancelledRef.current = true;
      timers.forEach(window.clearTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  /* ── DYK rotation — independent 5s timer ── */
  useEffect(() => {
    if (screen !== "loading") return;
    const id = window.setInterval(() => setDykIndex(i => (i + 1) % DID_YOU_KNOW.length), 5000);
    return () => window.clearInterval(id);
  }, [screen]);

  /* ── MCQ auto-advance 3s after answer ── */
  useEffect(() => {
    if (screen !== "loading" || quizAnswered === null) return;
    const timer = window.setTimeout(() => {
      setQuizIndex(i => (i + 1) % QUIZ_QUESTIONS.length);
      setQuizAnswered(null);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [screen, quizAnswered]);

  /* ── elapsed timer ── */
  useEffect(() => {
    if (screen !== "loading") { setElapsedSeconds(0); return; }
    const id = window.setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [screen]);

  /* ── helpers ── */
  const canEvaluate =
    entryMode === "upload" ? !!pdfFile :
    entryMode === "practice" ? (writeQuestion.trim().length > 3 && editorText.trim().length > 20) :
    false;

  const pctColor = (p: number) => p >= 75 ? "#448361" : p >= 50 ? "#C29243" : "#D44C47";

  const doEvaluate = () => {
    track('evaluate_started', { mode: entryMode || 'unknown' });
    setEvaluationError(null);
    if (entryMode === "practice") {
      setSubmittedQuestion(writeQuestion);
      setSubmittedText(editorText);
      setEntryTab("write");
    } else {
      setSubmittedQuestion("");
      setSubmittedText("");
      setEntryTab("pdf");
    }
    setDykIndex(0);
    setQuizIndex(0);
    setQuizAnswered(null);
    setQuizScore({ correct: 0, total: 0 });
    setLoadingStep(-1);
    setStreamTotal(0);
    setStreamCurrent(0);
    setStreamedResults([]);
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
    track('score_shared');
  };


  const fetchSuggestedAnswer = async () => {
    if (!result) return;
    setSuggestLoading(true);
    const weakDims = result.dimensions.filter(d => d.score < 6).map(d => d.name);
    const errors = result.factualErrors.map(e => ({ errorText: e.errorText, correction: e.correction }));
    try {
      const response = await fetch("https://PranshuT-upsc-answer-evaluator.hf.space/suggest-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: submittedText,
          question: submittedQuestion,
          improvements: result.improvements,
          factual_errors: errors,
          weak_dimensions: weakDims,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setSuggestedAnswer(data.suggested_answer);
        setShowSuggestedView(true);
      } else {
        console.warn("Suggest answer failed:", response.status);
        setSuggestedAnswer("Could not generate suggestion. Try again later.");
        setShowSuggestedView(true);
      }
    } catch (err) {
      console.error("Suggest answer error:", err);
      setSuggestedAnswer("Could not generate suggestion. Check your connection.");
      setShowSuggestedView(true);
    }
    setSuggestLoading(false);
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
    .walkthrough-row { display:flex; gap:12px; align-items:stretch; overflow-x:auto; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; scrollbar-width:none; }
    .walkthrough-row::-webkit-scrollbar { display:none; }
    .walkthrough-step { scroll-snap-align:start; flex-shrink:0; min-width:150px; flex:1; }
    @media(max-width:600px) { .walkthrough-step { min-width:140px; flex:none; width:70vw; } .walkthrough-arrow { display:none; } }
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
          <div style={{ width: 26, height: 26, borderRadius: 5, border: "1px solid var(--c-border)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Serif',serif", fontWeight: 700, fontSize: 13 }}>A</div>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Abhyaas AI</span>
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
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--c-accent)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono',monospace", marginBottom: 10 }}>AI mapped on a decade of UPSC examiner behavior</p>
              <h1 style={{ fontFamily: "'Noto Serif',Georgia,serif", fontWeight: 700, fontSize: 28, lineHeight: 1.3, marginBottom: 10 }}>Write. Evaluate. Improve. Score.</h1>
              <p style={{ color: "var(--c-text-secondary)", fontSize: 14, lineHeight: 1.65, marginBottom: 16 }}>We&apos;re building a real tool for UPSC Mains prep. This is the demo — answer evaluation and practice. The full platform is coming soon.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
                {[
                  { dot: "var(--c-green)", label: "7 scoring dimensions" },
                  { dot: "var(--c-accent)", label: "Factual error detection" },
                  { dot: "var(--c-amber)", label: "Examiner behavior modeled" },
                ].map((pill, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, border: "1px solid var(--c-border)", background: "var(--c-surface)", fontSize: 12, color: "var(--c-text-secondary)" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: pill.dot, flexShrink: 0 }} />
                    {pill.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Entry instruction */}
            <p style={{ color: "var(--c-text-secondary)", fontSize: "0.85rem", textAlign: "center", marginBottom: 12 }}>Upload a single question-answer pair per PDF. For multiple questions, submit one at a time.</p>

            {/* Entry cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 4 }}>
              {/* Upload card */}
              <button
                className={`entry-card${entryMode === "upload" ? " active" : ""}`}
                onClick={() => { const next = entryMode === "upload" ? null : "upload"; setEntryMode(next); if (next) track('entry_mode_selected', { mode: 'upload' }); }}
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
                onClick={() => { const next = entryMode === "practice" ? null : "practice"; setEntryMode(next); if (next) track('entry_mode_selected', { mode: 'practice' }); }}
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
                    <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>Drop your answer sheet</p>
                    <p style={{ fontSize: 13, color: "var(--c-text-secondary)" }}>or click to browse. Works with handwritten sheets.</p>
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

            {/* Step walkthrough */}
            <div style={{ marginTop: 36 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono',monospace", marginBottom: 16 }}>How it works</p>
              <div className="walkthrough-row">
                {([
                  { icon: <IconUpload size={18} />, bg: "var(--c-accent)", title: "Reads your handwriting", sub: "Even messy handwriting. We've tested it." },
                  { icon: <IconBrain size={18} />, bg: "var(--c-amber)", title: "Examiner-grade scoring", sub: "No sugarcoating, no bias. A replica of the UPSC examiner." },
                  { icon: <IconBarChart size={18} />, bg: "var(--c-green)", title: "Catches what you missed", sub: "Wrong date? Misquoted article? It shows up here." },
                  { icon: <IconTrendingUp size={18} />, bg: "var(--c-accent)", title: "What to fix first", sub: "The one change that moves your score the most." },
                ] as Array<{ icon: React.ReactNode; bg: string; title: string; sub: string }>).map((step, i, arr) => (
                  <React.Fragment key={i}>
                    <div className="walkthrough-step" style={{ padding: 16, borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: step.bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", marginBottom: 12, flexShrink: 0 }}>
                        {step.icon}
                      </div>
                      <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 5, color: "var(--c-text)" }}>{step.title}</p>
                      <p style={{ fontSize: 12, color: "var(--c-text-secondary)", lineHeight: 1.55 }}>{step.sub}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="walkthrough-arrow" style={{ display: "flex", alignItems: "center", flexShrink: 0, color: "var(--c-text-tertiary)", fontSize: 16 }}>→</div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>


          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            SCREEN 2 — LOADING
        ════════════════════════════════════════════════════════════════ */}
        {screen === "loading" && (
          <div style={{ animation: "upscFadeIn 0.2s ease", paddingTop: 64, paddingBottom: 48, maxWidth: 480, margin: "0 auto" }}>

            {/* ── Error card ── */}
            {evaluationError ? (
              <div style={{ border: "1px solid var(--c-border)", borderRadius: 10, background: "var(--c-surface)", padding: "28px 24px" }}>
                <p style={{ fontSize: 15, fontWeight: 500, color: "var(--c-text)", lineHeight: 1.6, marginBottom: 10 }}>
                  Lots of aspirants evaluating right now — our free servers are at capacity.
                </p>
                <p style={{ fontSize: 13, color: "var(--c-text-secondary)", lineHeight: 1.65, marginBottom: 24 }}>
                  Your answer is worth evaluating. Apologies for the inconvenience — try again in a few minutes.
                </p>
                <button
                  onClick={() => { setEvaluationError(null); setScreen("entry"); }}
                  style={{ padding: "9px 20px", borderRadius: 6, border: "none", background: "var(--c-text)", color: "var(--c-bg)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Try Again
                </button>
              </div>
            ) : (
            <>
            <h2 style={{ fontWeight: 500, fontSize: 15, textAlign: "center", marginBottom: 32, color: "var(--c-text)" }}>Reading through your answers</h2>

            {/* Step checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
              {([
                entryTab === "pdf" ? "Extracting text from PDF..." : "Processing your answer...",
                "Reading your handwriting",
                "Finding each answer on the page",
                "Scoring against UPSC standards",
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

            {/* Timer + status message */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              {elapsedSeconds < 90 ? (
                <p style={{ fontSize: 12, color: "var(--c-text-secondary)" }}>Typically takes ~90 seconds</p>
              ) : (
                <p style={{ fontSize: 12, color: "#C29243" }}>Taking longer than usual — lots of aspirants evaluating right now</p>
              )}
              <span style={{ fontSize: 11, color: "var(--c-text-tertiary)", fontFamily: "'JetBrains Mono',monospace", flexShrink: 0, marginLeft: 12 }}>⏱ {elapsedSeconds}s</span>
            </div>

            {/* Did You Know card — always visible, auto-rotates every 5s */}
            <div key={dykIndex} style={{ animation: "upscFadeIn 0.3s ease", border: "1px solid var(--c-border)", borderRadius: 10, background: "var(--c-surface)", padding: "20px 22px", marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-accent)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono',monospace", marginBottom: 14 }}>Did You Know</p>
              <p style={{ fontFamily: "'Noto Serif',Georgia,serif", fontSize: 24, fontWeight: 700, color: "var(--c-text)", lineHeight: 1.2, marginBottom: 10 }}>
                {DID_YOU_KNOW[dykIndex].big}
              </p>
              <p style={{ fontSize: 13, color: "var(--c-text-secondary)", lineHeight: 1.7, marginBottom: 14 }}>
                {DID_YOU_KNOW[dykIndex].fact}
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {DID_YOU_KNOW[dykIndex].tags.map((tag, i) => (
                  <span key={i} style={{ padding: "2px 8px", borderRadius: 4, background: "var(--c-accent-bg)", color: "var(--c-accent)", fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Quick Quiz card — always visible, advances after answer (3s) */}
            {(() => {
              const q = QUIZ_QUESTIONS[quizIndex];
              return (
                <div style={{ animation: "upscFadeIn 0.3s ease", border: "1px solid var(--c-border)", borderRadius: 10, background: "var(--c-surface)", padding: "20px 22px" }}>
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
            })()}
            </>
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

            {/* Streaming progress banner */}
            {streamTotal > 0 && streamedResults.length < streamTotal && (
              <div style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--c-accent)", background: "var(--c-accent-bg)", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
                <IconSpinner size={14} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--c-text)" }}>
                    Evaluating answer {streamCurrent + 1} of {streamTotal}...
                  </p>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    {Array.from({ length: streamTotal }, (_, i) => (
                      <span key={i} style={{
                        padding: "2px 8px", borderRadius: 4, fontSize: 11,
                        fontFamily: "'JetBrains Mono',monospace",
                        background: i < streamedResults.length ? "var(--c-green-bg)" : i === streamCurrent ? "var(--c-accent-bg)" : "var(--c-surface-hover)",
                        color: i < streamedResults.length ? "var(--c-green)" : i === streamCurrent ? "var(--c-accent)" : "var(--c-text-tertiary)",
                        border: `1px solid ${i < streamedResults.length ? "var(--c-green)" : i === streamCurrent ? "var(--c-accent)" : "var(--c-border)"}`,
                      }}>
                        Q{i + 1} {i < streamedResults.length ? "✓" : i === streamCurrent ? "●" : "○"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Summary banner */}
            <h2 style={{ fontWeight: 500, fontSize: 15, marginBottom: 12, color: "var(--c-text)" }}>Your scorecard</h2>
            <div style={{ border: "1px solid var(--c-border)", borderRadius: 10, background: "var(--c-surface)", padding: 24, marginBottom: 14, display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
              <ScoreRing score={result.overallScore} max={result.maxScore} size={96} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{result.overallScore} / {result.maxScore} · {result.percentage}%</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                  {result.summary.strengths.map((s, i) => <span key={i} style={{ padding: "5px 11px", borderRadius: 4, fontSize: 13, background: "var(--c-green-bg)", color: "var(--c-green)", fontWeight: 500 }}>{s}</span>)}
                  {result.summary.weaknesses.map((w, i) => <span key={i} style={{ padding: "5px 11px", borderRadius: 4, fontSize: 13, background: "var(--c-red-bg)", color: "var(--c-red)", fontWeight: 500 }}>{w}</span>)}
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
                <h3 style={{ fontWeight: 500, fontSize: 15, marginBottom: 4, color: "var(--c-text)" }}>Where you scored</h3>
                <p style={{ fontSize: 12, color: "var(--c-text-secondary)", marginBottom: 16 }}>Each bar is what an examiner checks for.</p>
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
                        <button className={`v3-fbtn${fb === "agree" ? " agree" : ""}`} onClick={() => { setDimFb(p => ({ ...p, [dim.name]: "agree" })); track('score_feedback', { dimension: dim.name, vote: 'agree' }); }}>
                          <IconThumbUp size={12} filled={fb === "agree"} /> Yes
                        </button>
                        <button className={`v3-fbtn${fb === "disagree" ? " disagree" : ""}`} onClick={() => { setDimFb(p => ({ ...p, [dim.name]: "disagree" })); track('score_feedback', { dimension: dim.name, vote: 'disagree' }); }}>
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
                    <p style={{ fontWeight: 500, color: "var(--c-green)" }}>No factual errors. Nice.</p>
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
                          <button className={`v3-fbtn${fb === "correct" ? " agree" : ""}`} onClick={() => { setErrFb(p => ({ ...p, [i]: "correct" })); track('error_feedback', { flag: 'correct' }); }}>Yes, it's wrong</button>
                          <button className={`v3-fbtn${fb === "wrong" ? " disagree" : ""}`} onClick={() => { setErrFb(p => ({ ...p, [i]: "wrong" })); track('error_feedback', { flag: 'wrong' }); }}>AI is wrong here</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── IMPROVE ── */}
            {resultTab === "improve" && (() => {
              const diffs = buildDiffsFromResult(result);
              const diffStats = diffs.length > 0 ? {
                replacements: diffs.filter(d => d.diff_type === "replace").length,
                weaknesses: diffs.filter(d => d.diff_type === "weakness").length,
              } : null;

              return (
                <div style={{ animation: "upscSlideIn 0.15s ease" }}>
                  <h3 style={{ fontWeight: 500, fontSize: 15, marginBottom: 4, color: "var(--c-text)" }}>How to score higher</h3>
                  <p style={{ fontSize: 12, color: "var(--c-text-secondary)", marginBottom: 16 }}>Start with the first one. It&apos;ll make the biggest difference.</p>
                  {diffs.length > 0 ? (
                    <>
                      {/* Stats bar */}
                      <div style={{ display: "flex", gap: 14, padding: "6px 0 14px", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", color: "var(--c-text-tertiary)" }}>
                        {diffStats!.replacements > 0 && (
                          <span style={{ color: "var(--c-red)" }}>{diffStats!.replacements} correction{diffStats!.replacements > 1 ? "s" : ""}</span>
                        )}
                        {diffStats!.weaknesses > 0 && (
                          <span style={{ color: "var(--c-amber)" }}>{diffStats!.weaknesses} improvement{diffStats!.weaknesses > 1 ? "s" : ""}</span>
                        )}
                        <span>{diffs.length} total changes</span>
                      </div>

                      {/* Diff cards */}
                      {diffs.map((diff, i) => (
                        <div key={i} style={{ border: "1px solid var(--c-border)", borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
                          {/* Header */}
                          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--c-surface-hover)", borderBottom: "1px solid var(--c-border)" }}>
                            <span style={{
                              fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700,
                              padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.03em",
                              background: diff.diff_type === "replace" ? "var(--c-red-bg)" : "var(--c-amber-bg)",
                              color: diff.diff_type === "replace" ? "var(--c-red)" : "var(--c-amber)",
                            }}>
                              {diff.dimension}
                            </span>
                            <span style={{ fontSize: 11, color: "var(--c-text-tertiary)" }}>
                              {diff.diff_type === "replace" ? "Correction" : "Improve"}
                            </span>
                          </div>
                          {/* Original — red */}
                          <div style={{ display: "flex", gap: 8, padding: "8px 12px", background: "var(--c-red-bg)", borderLeft: "3px solid var(--c-red)" }}>
                            <span style={{ color: "var(--c-red)", fontWeight: 700, fontSize: 13, flexShrink: 0, lineHeight: 1.65 }}>−</span>
                            <p style={{
                              fontSize: 13, lineHeight: 1.65, color: "var(--c-red)",
                              textDecoration: diff.diff_type === "replace" ? "line-through" : "none",
                              opacity: 0.85,
                              fontFamily: diff.diff_type === "replace" ? "'Noto Serif',Georgia,serif" : "inherit",
                              fontStyle: diff.diff_type === "replace" ? "italic" : "normal",
                            }}>
                              {diff.diff_type === "replace" ? `"${diff.original_text}"` : diff.original_text}
                            </p>
                          </div>
                          {/* Suggested — green */}
                          <div style={{ display: "flex", gap: 8, padding: "8px 12px", background: "var(--c-green-bg)", borderLeft: "3px solid var(--c-green)" }}>
                            <span style={{ color: "var(--c-green)", fontWeight: 700, fontSize: 13, flexShrink: 0, lineHeight: 1.65 }}>+</span>
                            <p style={{ fontSize: 13, lineHeight: 1.65, color: "var(--c-text)" }}>{diff.suggested_text}</p>
                          </div>
                          {/* Reason */}
                          {diff.reason && (
                            <div style={{ padding: "6px 12px 8px", borderTop: "1px solid var(--c-border)" }}>
                              <p style={{ fontSize: 11, color: "var(--c-text-tertiary)", fontStyle: "italic", lineHeight: 1.5 }}>{diff.reason}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  ) : (
                    /* Fallback: numbered tips */
                    result.improvements.map((imp, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", marginBottom: 8, transition: "background 0.12s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--c-surface-hover)"}
                        onMouseLeave={e => e.currentTarget.style.background = "var(--c-surface)"}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: "var(--c-accent-bg)", color: "var(--c-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>{i + 1}</div>
                        <p style={{ fontSize: 13, color: "var(--c-text)", lineHeight: 1.6 }}>{imp}</p>
                      </div>
                    ))
                  )}
                </div>
              );
            })()}

            {/* ── YOUR TEXT ── */}
            {resultTab === "text" && (() => {
              const diffs = buildDiffsFromResult(result);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const displayText = (submittedText || (result as any)?.extractedText || "[No text available]")
                .replace(/\*\*(.*?)\*\*/g, '$1')
                .replace(/^#{1,3}\s*/gm, '');
              return (
                <div style={{ animation: "upscSlideIn 0.15s ease", padding: 16, borderRadius: 8, background: "var(--c-surface)", border: "1px solid var(--c-border)" }}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'JetBrains Mono',monospace" }}>Extracted text</p>
                      {diffs.length > 0 && (
                        <span style={{ fontSize: 10, color: "var(--c-text-tertiary)", fontFamily: "'JetBrains Mono',monospace" }}>highlighted = has suggested changes</span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: "var(--c-text-secondary)" }}>This is what we read from your sheet. Check if anything looks off.</p>
                  </div>
                  {(displayText.includes("[IMPROVED") || displayText.includes("[ADDED")) ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {renderSuggestedAnswer(displayText)}
                    </div>
                  ) : (
                    <div style={{ fontFamily: "'JetBrains Mono',Menlo,monospace", fontSize: 12, lineHeight: 1.85, color: "var(--c-text-secondary)", whiteSpace: "pre-wrap" }}>
                      {renderHighlightedText(displayText, diffs)}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Suggested answer card */}
            {showSuggestedView && suggestedAnswer && (
              <div style={{ marginTop: 24, border: "1px solid var(--c-border)", borderRadius: 10, background: "var(--c-surface)", padding: 20, animation: "upscSlideIn 0.15s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--c-accent)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono',monospace" }}>Suggested Version</p>
                  <button onClick={() => setShowSuggestedView(false)} style={{ padding: 4, border: "none", background: "transparent", color: "var(--c-text-secondary)", cursor: "pointer", display: "flex", alignItems: "center" }}><IconX size={14} /></button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {renderSuggestedAnswer(suggestedAnswer)}
                </div>
                <p style={{ marginTop: 14, fontSize: 11, color: "var(--c-text-tertiary)", fontFamily: "'JetBrains Mono',monospace" }}>
                  {[...suggestedAnswer.matchAll(/\[(IMPROVED|ADDED)\]/g)].length} improvements applied
                </p>
              </div>
            )}

            {/* Action row — bordered compact buttons */}
            <div style={{ marginTop: 24, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => { setShowSuggestPrompt(p => !p); track('suggested_answer_requested'); }}
                disabled={suggestLoading}
                style={{ padding: "7px 16px", borderRadius: 6, border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-text-secondary)", fontSize: 13, cursor: suggestLoading ? "default" : "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6, opacity: suggestLoading ? 0.65 : 1 }}
                onMouseEnter={e => { if (!suggestLoading) e.currentTarget.style.borderColor = "var(--c-text-tertiary)"; }}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--c-border)"}>
                {suggestLoading && <IconSpinner size={12} />}
                See Suggested Answer
              </button>
              <button
                onClick={() => { window.open(`https://tally.so/r/WO1Llk?score=${result?.percentage ?? 0}`, '_blank'); track('rating_submitted', { stars: 0 }); }}
                style={{ padding: "7px 16px", borderRadius: 6, border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-text-secondary)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--c-text-tertiary)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--c-border)"}>
                Rate
              </button>
              <button
                onClick={doShare}
                style={{ padding: "7px 16px", borderRadius: 6, border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-text-secondary)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--c-text-tertiary)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--c-border)"}>
                {shareMsg || "Share"}
              </button>
            </div>

            {/* Early access link */}
            <p style={{ marginTop: 14, textAlign: "center", fontSize: "0.8rem", color: "var(--c-text-secondary)" }}>
              Enjoying Abhyaas AI?{" "}
              <a
                href={`https://tally.so/r/WO1Llk?score=${result?.percentage ?? 0}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--c-text-secondary)", textDecoration: "underline" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--c-text)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--c-text-secondary)")}>
                Drop your feedback for early access to new features →
              </a>
            </p>

            {/* Inline suggest prompt */}
            {showSuggestPrompt && (
              <div style={{ marginTop: 14, padding: "14px 16px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", animation: "upscSlideIn 0.15s ease" }}>
                <p style={{ fontSize: 13, color: "var(--c-text)", lineHeight: 1.65, marginBottom: 12 }}>Want to try rewriting yourself first? You'll improve more by trying.</p>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  <button
                    onClick={() => { doRetryWrite(); track('suggested_answer_choice', { choice: 'try_first' }); }}
                    style={{ background: "none", border: "none", fontSize: 13, color: "var(--c-accent)", cursor: "pointer", padding: 0, display: "inline-flex", alignItems: "center", gap: 4 }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                    Let me try first <IconArrowRight size={12} />
                  </button>
                  <button
                    onClick={() => { setShowSuggestPrompt(false); fetchSuggestedAnswer(); track('suggested_answer_choice', { choice: 'show_me' }); }}
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

      {/* FEEDBACK MODAL removed — Rate button now opens Tally form */}
    </div>
  );
}
