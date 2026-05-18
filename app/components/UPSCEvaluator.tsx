"use client";
import { useState, useRef, useEffect } from "react";
import type { CSSProperties } from "react";

const API_URL = "https://PranshuT-upsc-answer-evaluator.hf.space/evaluate";

/* ── Icons ──────────────────────────────────────────────────────────────── */
function IconUploadCloud() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

function IconFile() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  );
}

function IconCheck({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconX({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function IconScan() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <rect x="7" y="7" width="10" height="10" rx="1" />
    </svg>
  );
}

function IconCpu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
    </svg>
  );
}

function IconAlertTriangle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconArrowUp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function IconBulb() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" stroke="var(--border)" strokeWidth="3" />
      <circle
        cx="16" cy="16" r="13"
        stroke="var(--accent)" strokeWidth="3"
        strokeDasharray="20 61.73" strokeLinecap="round"
        style={{ animation: "notionSpin 1.4s linear infinite", transformOrigin: "center" }}
      />
    </svg>
  );
}

/* ── UPSC Tips ──────────────────────────────────────────────────────────── */
const TIPS = [
  { category: "Depth over Breadth", text: "Focus on causal linkages and systemic roots rather than listing disconnected surface-level points. Incorporate second-order effects and macro-consequences." },
  { category: "Economy of Words", text: "Eliminate rhetorical filler. Use condensed technical terms like 'fiscal profligacy' instead of 'spending too much public money'. Every word must earn its place." },
  { category: "Balanced Analysis", text: "When facing conflicting socio-economic goals, acknowledge both structural realities objectively. Conclude using a constructive, constitutional framework." },
  { category: "Structural Flow", text: "Follow the 10-70-20 rule: 10% contextual introduction, 70% core multi-part body responding to directives, 20% forward-looking conclusion." },
  { category: "Fact-Grounded Claims", text: "Anchor every argument using Supreme Court judgments, specific constitutional articles, or government committee reports. Never leave claims unsubstantiated." },
  { category: "Directive: Critically Analyze", text: "Structure as: Arguments For (3-4 points) + Arguments Against (3-4 points) + Systemic structural root cause + Forward-looking Way Forward." },
  { category: "Directive: Discuss", text: "Use the PERSPECT matrix: map Political, Economic, Religious, Scientific, Philosophical, Environmental, and Legal dimensions with institutional proof." },
  { category: "Directive: Examine", text: "Probe the 'why' and 'how', not just the 'what'. Present structural background, identify macro-drivers, outline current status, highlight bottlenecks." },
  { category: "Directive: Comment", text: "Express an evidence-backed position. Acknowledge the premise, support or refute with data and case law, then deliver an unambiguous professional conclusion." },
  { category: "Hub-and-Spoke Model", text: "Use a central concept connected to 5-6 thematic spokes with high-density data. Saves time and word count while delivering intense factual presentation." },
  { category: "Visual Efficiency", text: "Use explicit subheadings that mirror the prompt's structural components. Maintain clear transitions with bulleted core matrices for examiner readability." },
  { category: "Ethics Case Studies", text: "Use the Core-Periphery model: isolate the primary moral dilemma at the center, then map systemic ripple effects across distinct stakeholders." },
];

/* ── Mock data ──────────────────────────────────────────────────────────── */
const MOCK_RESULTS = {
  answers: [
    {
      question: "Discuss the role of the judiciary in protecting fundamental rights in India.",
      extractedText: "The judiciary plays a crucial role in protecting fundamental rights enshrined in Part III of the Indian Constitution. Through judicial review under Article 13, courts can strike down laws that violate fundamental rights. The Supreme Court, as the guardian of the Constitution under Article 32, provides direct access to citizens for enforcement of their fundamental rights through writs like Habeas Corpus, Mandamus, Prohibition, Certiorari, and Quo Warranto...",
      overallScore: 7.2,
      maxScore: 10,
      dimensions: [
        { name: "Introduction", score: 8, max: 10, comment: "Good opening with constitutional reference. Could add a recent judicial development as a hook." },
        { name: "Content Accuracy", score: 7, max: 10, comment: "Correctly mentions Article 13 and Article 32. Missing: Article 226 (HC powers), PIL evolution, and recent landmark cases like Puttaswamy." },
        { name: "Structure & Flow", score: 7, max: 10, comment: "Logical flow but needs clearer sub-headings. Use: Introduction → Constitutional Provisions → Landmark Cases → Challenges → Way Forward → Conclusion." },
        { name: "UPSC Keywords", score: 6, max: 10, comment: "Missing key terms: 'judicial activism', 'basic structure doctrine', 'constitutional morality', 'living document theory'." },
        { name: "Conclusion", score: 8, max: 10, comment: "Decent wrap-up. Add a forward-looking statement connecting judiciary's role to democratic resilience." },
      ],
      factualErrors: [
        { text: "Article 32 covers all courts", correction: "Article 32 is specific to the Supreme Court. High Courts exercise similar powers under Article 226." },
        { text: "Writ jurisdiction is unlimited", correction: "Writ jurisdiction has limitations — Article 32 is only for fundamental rights, while Article 226 is broader covering 'any other purpose'." },
      ],
      improvements: [
        "Add 2-3 landmark cases: Maneka Gandhi v. Union of India (1978), Vishaka v. State of Rajasthan (1997), K.S. Puttaswamy v. Union of India (2017)",
        "Include a diagram showing the hierarchy of judicial protection mechanisms",
        "Discuss challenges: judicial overreach, pendency of cases, appointment controversies (NJAC case)",
        "Add comparative perspective: how Indian judicial review differs from the UK (parliamentary sovereignty) and USA (due process clause)",
        "Use the UPSC-preferred format: definition/context → multidimensional analysis → balanced conclusion",
      ],
    },
    {
      question: "Examine the impact of GST on Indian federalism.",
      extractedText: "The Goods and Services Tax (GST), implemented on July 1, 2017, through the 101st Constitutional Amendment Act, has significantly impacted the federal structure of India. It subsumed multiple indirect taxes like excise duty, service tax, VAT, and created a unified national market...",
      overallScore: 6.5,
      maxScore: 10,
      dimensions: [
        { name: "Introduction", score: 7, max: 10, comment: "Good factual opening. Add the 'One Nation One Tax' vision statement for context." },
        { name: "Content Accuracy", score: 7, max: 10, comment: "Correct on basics. Missing: GST Council's composition under Article 279A, compensation cess controversy, and cooperative federalism angle." },
        { name: "Structure & Flow", score: 6, max: 10, comment: "Needs two-sided analysis. Cover both: strengthening federalism (uniform market) AND weakening it (states losing fiscal autonomy)." },
        { name: "UPSC Keywords", score: 5, max: 10, comment: "Must include: 'fiscal federalism', 'cooperative federalism', 'subsidiarity principle', 'horizontal equity', 'tax buoyancy'." },
        { name: "Conclusion", score: 7, max: 10, comment: "Reasonable conclusion. Needs a balanced view — acknowledge both centralizing tendency and cooperative framework." },
      ],
      factualErrors: [
        { text: "GST completely replaced all indirect taxes", correction: "Petroleum products, alcohol for human consumption, and electricity are still outside GST. Basic customs duty also remains." },
      ],
      improvements: [
        "Discuss the GST Council as a model of cooperative federalism — decision-making mechanism, voting weightage",
        "Add the compensation cess issue (states' grievances post-COVID)",
        "Include data: GST collection trends, compliance rates",
        "Compare with other federal countries: Australia's GST model, Canada's HST",
        "Discuss recent developments: GST appellate tribunal, rate rationalization",
      ],
    },
  ],
  summary: {
    totalScore: 13.7,
    totalMax: 20,
    percentage: 68.5,
    strengths: ["Good constitutional knowledge", "Decent introductions", "Logical flow"],
    weaknesses: ["Missing landmark cases", "Insufficient UPSC vocabulary", "Needs multidimensional analysis"],
    topRecommendation: "Focus on the PEEL method (Point → Evidence → Explanation → Link) for each paragraph. Add 2-3 specific examples per answer.",
  },
};

/* ── Types ──────────────────────────────────────────────────────────────── */
interface Dimension { name: string; score: number; max: number; comment: string; }
interface FactualError { text: string; correction: string; }
interface Answer {
  question: string; extractedText: string;
  overallScore: number; maxScore: number;
  dimensions: Dimension[]; factualErrors: FactualError[]; improvements: string[];
}
interface Results {
  answers: Answer[];
  summary: { totalScore: number; totalMax: number; percentage: number; strengths: string[]; weaknesses: string[]; topRecommendation: string; };
}

/* ── Score Ring ─────────────────────────────────────────────────────────── */
function ScoreRing({ score, max, size = 100 }: { score: number; max: number; size?: number }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 60); return () => clearTimeout(t); }, []);

  const sw = 5;
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = (score / max) * 100;
  const offset = animated ? circ - (pct / 100) * circ : circ;
  const color = pct >= 75 ? "var(--green)" : pct >= 50 ? "var(--orange)" : "var(--red)";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{
          fontFamily: "'Noto Serif', Georgia, serif",
          fontWeight: 700, fontSize: size * 0.19, color, lineHeight: 1,
        }}>
          {Math.round(pct)}%
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', Menlo, monospace",
          fontSize: size * 0.1, color: "var(--dim)", marginTop: 2,
        }}>
          {score}/{max}
        </span>
      </div>
    </div>
  );
}

/* ── Score Bar ──────────────────────────────────────────────────────────── */
function ScoreBar({ label, score, max, comment, delay = 0 }: {
  label: string; score: number; max: number; comment: string; delay?: number;
}) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), delay); return () => clearTimeout(t); }, [delay]);

  const pct = (score / max) * 100;
  const color = pct >= 75 ? "var(--green)" : pct >= 50 ? "var(--orange)" : "var(--red)";

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>{label}</span>
        <span style={{ fontFamily: "'JetBrains Mono', Menlo, monospace", fontSize: 12, color, fontWeight: 500 }}>
          {score}/{max}
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 3, background: color,
          width: animated ? `${pct}%` : "0%",
          transition: "width 0.7s ease",
        }} />
      </div>
      {comment && (
        <p style={{ marginTop: 5, fontSize: 12, color: "var(--dim)", lineHeight: 1.5 }}>{comment}</p>
      )}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────────── */
export default function UPSCEvaluator() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [results, setResults] = useState<Results | null>(null);
  const [activeAnswer, setActiveAnswer] = useState(0);
  const [activeTab, setActiveTab] = useState("scores");
  const [darkMode, setDarkMode] = useState(false);
  const [tipIdx, setTipIdx] = useState(0);
  const [tipFade, setTipFade] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading) return;
    const cycle = setInterval(() => {
      setTipFade(false);
      setTimeout(() => {
        setTipIdx((i) => (i + 1) % TIPS.length);
        setTipFade(true);
      }, 300);
    }, 5000);
    return () => clearInterval(cycle);
  }, [loading]);

  const loadingSteps = [
    "Extracting text from PDF",
    "Identifying question-answer blocks",
    "Evaluating against UPSC standards",
    "Generating improvement suggestions",
  ];

  const handleFile = (f: File | null | undefined) => {
    if (f && f.type === "application/pdf") setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setLoadingStep(0);

    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 3 + 1;
      if (p > 90) p = 90;
      setProgress(p);
      setLoadingStep(Math.min(Math.floor(p / 25), 3));
    }, 300);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(API_URL, { method: "POST", body: formData });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Evaluation failed");
      }
      const data = await response.json();
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => { setLoading(false); setResults(data); }, 500);
    } catch (error) {
      clearInterval(interval);
      setLoading(false);
      alert("Error: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const reset = () => { setFile(null); setResults(null); setActiveAnswer(0); setActiveTab("scores"); };

  const lightVars: Record<string, string> = {
    "--bg": "#FFFFFF", "--surface": "#FFFFFF", "--surface-raised": "#F1F1EF",
    "--fg": "#373530", "--fg-secondary": "#787774", "--dim": "#9B9A97",
    "--border": "#E9E9E7", "--border-hover": "#D8D8D6",
    "--green": "#548164", "--green-bg": "#EEF3ED", "--green-fg": "#548164",
    "--orange": "#CC782F", "--orange-bg": "#F8ECDF",
    "--red": "#C4554D", "--red-bg": "#FAECEC", "--red-fg": "#C4554D",
    "--blue": "#487CA5", "--blue-bg": "#E9F3F7",
    "--accent": "#487CA5", "--accent-bg": "#E9F3F7",
  };

  const darkVars: Record<string, string> = {
    "--bg": "#191919", "--surface": "#202020", "--surface-raised": "#2a2a2a",
    "--fg": "#D4D4D4", "--fg-secondary": "#9B9B9B", "--dim": "#6b6b6b",
    "--border": "#333333", "--border-hover": "#444444",
    "--green": "#4F9768", "--green-bg": "#242B26", "--green-fg": "#4F9768",
    "--orange": "#CB7B37", "--orange-bg": "#36291F",
    "--red": "#BE524B", "--red-bg": "#332523", "--red-fg": "#BE524B",
    "--blue": "#447ACB", "--blue-bg": "#1F282D",
    "--accent": "#447ACB", "--accent-bg": "#1F282D",
  };

  const theme = darkMode ? darkVars : lightVars;
  const answer = results?.answers[activeAnswer];

  const FEATURES = [
    { icon: <IconScan />, title: "OCR Extraction", desc: "Handwritten and typed PDF support with high-accuracy text extraction" },
    { icon: <IconCpu />, title: "AI Evaluation", desc: "Scored across 5 UPSC dimensions: introduction, content, structure, keywords, and conclusion" },
    { icon: <IconAlertTriangle />, title: "Error Detection", desc: "Identifies factual inaccuracies and provides accurate corrections" },
    { icon: <IconArrowUp />, title: "Improvements", desc: "Actionable, UPSC-specific suggestions to maximise your score" },
  ];

  return (
    <div style={{ ...(theme as unknown as CSSProperties), background: "var(--bg)", color: "var(--fg)", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", minHeight: "100vh", fontSize: 14 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes notionSpin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        button { cursor: pointer; font-family: inherit; }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        padding: "0 24px", height: 48,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, background: "var(--bg)", zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Noto Serif', Georgia, serif", fontWeight: 700, fontSize: 13,
            color: "var(--fg)",
          }}>U</div>
          <span style={{ fontWeight: 500, fontSize: 14, color: "var(--fg)" }}>UPSC Evaluator</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {results && (
            <button onClick={reset} style={{
              padding: "5px 12px", borderRadius: 6,
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--fg-secondary)", fontSize: 13, fontWeight: 500,
              transition: "border-color 0.15s ease",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >New upload</button>
          )}
          <button onClick={() => setDarkMode(!darkMode)} style={{
            width: 32, height: 32, borderRadius: 6,
            border: "1px solid var(--border)", background: "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--fg-secondary)", transition: "border-color 0.15s ease",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            {darkMode ? <IconSun /> : <IconMoon />}
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>

        {/* Upload screen */}
        {!loading && !results && (
          <div style={{ animation: "fadeIn 0.2s ease", paddingTop: 48, paddingBottom: 64 }}>
            <h1 style={{
              fontFamily: "'Noto Serif', Georgia, serif",
              fontWeight: 700, fontSize: 28, color: "var(--fg)",
              marginBottom: 10, lineHeight: 1.3,
            }}>
              Evaluate your UPSC Mains answers
            </h1>
            <p style={{ color: "var(--fg-secondary)", fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
              Upload your answer sheet PDF and receive AI-powered scoring, factual error detection, and UPSC-specific improvement suggestions.
            </p>

            {/* Drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); }}
              style={{
                border: `1.5px dashed ${dragActive ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 8,
                padding: "40px 24px",
                textAlign: "center",
                cursor: "pointer",
                background: dragActive ? "var(--accent-bg)" : "var(--surface-raised)",
                transition: "border-color 0.15s ease, background 0.15s ease",
                marginBottom: 16,
              }}
            >
              <input ref={fileRef} type="file" accept=".pdf" onChange={(e) => handleFile(e.target.files?.[0])} style={{ display: "none" }} />
              <div style={{ color: file ? "var(--accent)" : "var(--dim)", marginBottom: 10, display: "flex", justifyContent: "center" }}>
                {file ? <IconFile /> : <IconUploadCloud />}
              </div>
              {file ? (
                <>
                  <p style={{ fontWeight: 500, fontSize: 14, color: "var(--fg)", marginBottom: 4 }}>{file.name}</p>
                  <p style={{ fontSize: 13, color: "var(--dim)" }}>{(file.size / 1024 / 1024).toFixed(2)} MB — click to change</p>
                </>
              ) : (
                <>
                  <p style={{ fontWeight: 500, fontSize: 14, color: "var(--fg)", marginBottom: 4 }}>Drop your PDF here</p>
                  <p style={{ fontSize: 13, color: "var(--dim)" }}>or click to browse</p>
                </>
              )}
            </div>

            {file && (
              <button onClick={handleUpload} style={{
                width: "100%", padding: "10px", borderRadius: 6, marginBottom: 32,
                border: "1px solid var(--accent)", background: "var(--accent-bg)",
                color: "var(--accent)", fontSize: 14, fontWeight: 600,
                transition: "background 0.15s ease, color 0.15s ease",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "var(--bg)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent-bg)"; e.currentTarget.style.color = "var(--accent)"; }}
              >
                Evaluate answers
              </button>
            )}

            {/* Feature cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {FEATURES.map((f, i) => (
                <div key={i} style={{
                  padding: 16, border: "1px solid var(--border)", borderRadius: 8,
                  background: "var(--surface)", transition: "border-color 0.15s ease",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  <div style={{ color: "var(--accent)", marginBottom: 10 }}>{f.icon}</div>
                  <p style={{ fontWeight: 500, fontSize: 13, color: "var(--fg)", marginBottom: 4 }}>{f.title}</p>
                  <p style={{ fontSize: 12, color: "var(--dim)", lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading screen */}
        {loading && (
          <div style={{ paddingTop: 72, paddingBottom: 64, maxWidth: 440, margin: "0 auto", animation: "fadeIn 0.2s ease" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <Spinner />
            </div>
            <h2 style={{
              fontFamily: "'Noto Serif', Georgia, serif",
              fontWeight: 600, fontSize: 20, textAlign: "center",
              marginBottom: 24, color: "var(--fg)",
            }}>
              Processing your answers
            </h2>

            <div style={{ height: 3, borderRadius: 2, background: "var(--border)", marginBottom: 32, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 2, background: "var(--accent)",
                width: `${progress}%`, transition: "width 0.2s ease",
              }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {loadingSteps.map((step, i) => {
                const done = i < loadingStep;
                const active = i === loadingStep;
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    opacity: done || active ? 1 : 0.35,
                    transition: "opacity 0.3s ease",
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                      border: `1px solid ${done ? "var(--green)" : active ? "var(--accent)" : "var(--border)"}`,
                      background: done ? "var(--green-bg)" : active ? "var(--accent-bg)" : "transparent",
                      color: done ? "var(--green)" : active ? "var(--accent)" : "var(--dim)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 500,
                    }}>
                      {done ? <IconCheck size={11} /> : i + 1}
                    </div>
                    <span style={{
                      fontSize: 13, fontWeight: active ? 500 : 400,
                      color: active ? "var(--fg)" : "var(--fg-secondary)",
                    }}>{step}</span>
                  </div>
                );
              })}
            </div>

            {/* Rotating tips card */}
            <div style={{
              border: "1px solid var(--border)", borderRadius: 8,
              background: "var(--surface-raised)", padding: "16px 18px",
            }}>
              <div style={{
                opacity: tipFade ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  marginBottom: 8,
                }}>
                  <span style={{ color: "var(--accent)", display: "flex", alignItems: "center" }}>
                    <IconBulb />
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: "var(--accent)",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>
                    {TIPS[tipIdx].category}
                  </span>
                </div>
                <p style={{
                  fontSize: 13, color: "var(--fg-secondary)",
                  lineHeight: 1.6, marginBottom: 14,
                }}>
                  {TIPS[tipIdx].text}
                </p>
              </div>
              {/* Dot indicators */}
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                {TIPS.map((_, i) => (
                  <div key={i} style={{
                    height: 4, borderRadius: 2,
                    width: i === tipIdx ? 16 : 4,
                    background: i === tipIdx ? "var(--accent)" : "var(--border)",
                    transition: "width 0.3s ease, background 0.3s ease",
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results screen */}
        {results && !loading && (
          <div style={{ paddingTop: 32, paddingBottom: 64, animation: "fadeIn 0.2s ease" }}>

            {/* Summary card */}
            <div style={{
              border: "1px solid var(--border)", borderRadius: 8,
              background: "var(--surface)", padding: 24, marginBottom: 20,
            }}>
              <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
                <ScoreRing score={results.summary.totalScore} max={results.summary.totalMax} size={100} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h2 style={{
                    fontFamily: "'Noto Serif', Georgia, serif",
                    fontWeight: 600, fontSize: 18, color: "var(--fg)", marginBottom: 4,
                  }}>Overall Performance</h2>
                  <p style={{
                    fontFamily: "'JetBrains Mono', Menlo, monospace",
                    fontSize: 12, color: "var(--dim)", marginBottom: 14,
                  }}>
                    {results.summary.totalScore}/{results.summary.totalMax} · {results.summary.percentage.toFixed(1)}%
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                    {results.summary.strengths.map((s, i) => (
                      <span key={i} style={{
                        padding: "3px 8px", borderRadius: 4, fontSize: 12,
                        background: "var(--green-bg)", color: "var(--green)", fontWeight: 500,
                      }}>{s}</span>
                    ))}
                    {results.summary.weaknesses.map((w, i) => (
                      <span key={i} style={{
                        padding: "3px 8px", borderRadius: 4, fontSize: 12,
                        background: "var(--red-bg)", color: "var(--red)", fontWeight: 500,
                      }}>{w}</span>
                    ))}
                  </div>
                  <div style={{
                    padding: "10px 14px", borderRadius: 6,
                    background: "var(--accent-bg)", borderLeft: "3px solid var(--accent)",
                  }}>
                    <p style={{
                      fontSize: 11, fontWeight: 600, color: "var(--accent)",
                      textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4,
                    }}>Top recommendation</p>
                    <p style={{ fontSize: 13, color: "var(--fg-secondary)", lineHeight: 1.5 }}>
                      {results.summary.topRecommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Answer selector */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {results.answers.map((a, i) => {
                const pct = (a.overallScore / a.maxScore) * 100;
                const dotColor = pct >= 75 ? "var(--green)" : pct >= 50 ? "var(--orange)" : "var(--red)";
                const active = activeAnswer === i;
                return (
                  <button key={i} onClick={() => { setActiveAnswer(i); setActiveTab("scores"); }} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "7px 14px", borderRadius: 6,
                    border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                    background: active ? "var(--accent-bg)" : "var(--surface)",
                    color: active ? "var(--accent)" : "var(--fg-secondary)",
                    fontSize: 13, fontWeight: 500, transition: "all 0.15s ease",
                  }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>Q{i + 1}</span>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, display: "inline-block", flexShrink: 0 }} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{a.overallScore}/{a.maxScore}</span>
                  </button>
                );
              })}
            </div>

            {/* Answer detail card */}
            {answer && (
              <div style={{ border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", overflow: "hidden" }}>

                {/* Question header */}
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                    color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.06em",
                    display: "block", marginBottom: 6,
                  }}>Question {activeAnswer + 1}</span>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--fg)", lineHeight: 1.5 }}>
                    {answer.question}
                  </p>
                </div>

                {/* Notion underline tabs */}
                <div style={{ display: "flex", borderBottom: "1px solid var(--border)", padding: "0 20px" }}>
                  {[
                    { id: "scores", label: "Scores" },
                    { id: "errors", label: `Errors (${answer.factualErrors.length})` },
                    { id: "improve", label: `Improve (${answer.improvements.length})` },
                    { id: "text", label: "Extracted" },
                  ].map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                      padding: "10px 14px",
                      border: "none", background: "transparent",
                      fontSize: 13, fontWeight: 500,
                      color: activeTab === tab.id ? "var(--fg)" : "var(--dim)",
                      borderBottom: activeTab === tab.id ? "2px solid var(--fg)" : "2px solid transparent",
                      marginBottom: -1, transition: "color 0.15s ease",
                    }}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div style={{ padding: 20 }}>

                  {/* Scores tab */}
                  {activeTab === "scores" && (
                    <div>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 16,
                        marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid var(--border)",
                      }}>
                        <ScoreRing score={answer.overallScore} max={answer.maxScore} size={80} />
                        <div>
                          <p style={{ fontSize: 12, color: "var(--dim)", marginBottom: 2 }}>Answer score</p>
                          <p style={{
                            fontFamily: "'Noto Serif', Georgia, serif",
                            fontWeight: 600, fontSize: 22, color: "var(--fg)",
                          }}>{answer.overallScore} / {answer.maxScore}</p>
                        </div>
                      </div>
                      <p style={{
                        fontSize: 11, fontWeight: 600, color: "var(--dim)",
                        textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16,
                      }}>Dimension breakdown</p>
                      {answer.dimensions.map((d, i) => (
                        <ScoreBar key={i} label={d.name} score={d.score} max={d.max} comment={d.comment} delay={i * 80} />
                      ))}
                    </div>
                  )}

                  {/* Errors tab */}
                  {activeTab === "errors" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {answer.factualErrors.length === 0 ? (
                        <div style={{
                          padding: 24, textAlign: "center",
                          border: "1px solid var(--border)", borderRadius: 8, background: "var(--green-bg)",
                        }}>
                          <div style={{ color: "var(--green)", display: "flex", justifyContent: "center", marginBottom: 8 }}>
                            <IconCheck size={20} />
                          </div>
                          <p style={{ fontWeight: 500, fontSize: 14, color: "var(--green)" }}>No factual errors detected</p>
                        </div>
                      ) : answer.factualErrors.map((err, i) => (
                        <div key={i} style={{ borderRadius: 8, border: "1px solid var(--border)", overflow: "hidden" }}>
                          <div style={{ padding: "12px 16px", background: "var(--red-bg)", display: "flex", gap: 10 }}>
                            <div style={{ color: "var(--red)", flexShrink: 0, marginTop: 1 }}><IconX size={14} /></div>
                            <div>
                              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--red)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Error</p>
                              <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.5 }}>{err.text}</p>
                            </div>
                          </div>
                          <div style={{ padding: "12px 16px", background: "var(--green-bg)", display: "flex", gap: 10 }}>
                            <div style={{ color: "var(--green)", flexShrink: 0, marginTop: 1 }}><IconCheck size={14} /></div>
                            <div>
                              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Correction</p>
                              <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.5 }}>{err.correction}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Improve tab */}
                  {activeTab === "improve" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {answer.improvements.map((imp, i) => (
                        <div key={i} style={{
                          display: "flex", gap: 12, padding: "11px 12px",
                          borderRadius: 6, border: "1px solid var(--border)",
                          transition: "background 0.15s ease",
                        }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-raised)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <div style={{
                            width: 22, height: 22, borderRadius: 4, flexShrink: 0,
                            background: "var(--accent-bg)", color: "var(--accent)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600,
                          }}>{i + 1}</div>
                          <p style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.6, paddingTop: 2 }}>{imp}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Extracted text tab */}
                  {activeTab === "text" && (
                    <div style={{
                      padding: 16, borderRadius: 6,
                      background: "var(--surface-raised)", border: "1px solid var(--border)",
                    }}>
                      <p style={{
                        fontSize: 11, fontWeight: 600, color: "var(--dim)",
                        textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10,
                      }}>OCR output</p>
                      <p style={{
                        fontFamily: "'JetBrains Mono', Menlo, monospace",
                        fontSize: 12, lineHeight: 1.8,
                        color: "var(--fg-secondary)", whiteSpace: "pre-wrap",
                      }}>{answer.extractedText}</p>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "12px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 12, color: "var(--dim)" }}>Powered by Llama 3.3 70B</span>
        <span style={{ fontFamily: "'JetBrains Mono', Menlo, monospace", fontSize: 12, color: "var(--dim)" }}>v1.0</span>
      </footer>
    </div>
  );
}
