import { useState, useRef, useEffect } from "react";

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
        "Add comparative perspective: Mention how Indian judicial review differs from the UK (parliamentary sovereignty) and USA (due process clause)",
        "Use the UPSC-preferred format: start with a definition/context, move to multidimensional analysis, end with a balanced conclusion",
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
    strengths: ["Good constitutional knowledge", "Decent introductions", "Logical flow of arguments"],
    weaknesses: ["Missing landmark cases and recent developments", "Insufficient UPSC-specific vocabulary", "Needs more multidimensional analysis"],
    topRecommendation: "Focus on the PEEL method (Point → Evidence → Explanation → Link) for each paragraph. Add 2-3 specific examples per answer.",
  },
};

// Animated counter
function AnimatedScore({ value, max, duration = 1200 }: { value: number; max: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.round(start * 10) / 10);
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{display.toFixed(1)}<span style={{ opacity: 0.4, fontSize: "0.6em" }}>/{max}</span></span>;
}

// Score ring
function ScoreRing({ score, max, size = 120, strokeWidth = 8 }: { score: number; max: number; size?: number; strokeWidth?: number }) {
  const pct = (score / max) * 100;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 75 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
    </svg>
  );
}

function ScoreBar({ score, max, label, comment, delay = 0 }: { score: number; max: number; label: string; comment: string; delay?: number }) {
  const pct = (score / max) * 100;
  const color = pct >= 75 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <div style={{ marginBottom: 18, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)", transition: "all 0.5s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "var(--font-mono)" }}>{score}/{max}</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: "var(--border-subtle)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: visible ? `${pct}%` : "0%", background: color, borderRadius: 3, transition: "width 1s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
      <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.5, fontFamily: "var(--font-body)" }}>{comment}</p>
    </div>
  );
}

export default function UPSCEvaluator() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [results, setResults] = useState(null);
  const [activeAnswer, setActiveAnswer] = useState(0);
  const [activeTab, setActiveTab] = useState("scores");
  const [darkMode, setDarkMode] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadingSteps = [
    { icon: "📄", text: "Extracting text from PDF..." },
    { icon: "🔍", text: "Identifying question-answer blocks..." },
    { icon: "🧠", text: "Evaluating against UPSC standards..." },
    { icon: "✅", text: "Generating improvement suggestions..." },
  ];

  const handleFile = (f: File | null | undefined) => {
    if (f && f.type === "application/pdf") setFile(f);
  };

  const handleUpload = async () => {
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
  
      const response = await fetch(
        "https://PranshuT-upsc-answer-evaluator.hf.space/evaluate",
        { method: "POST", body: formData }
      );
  
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Evaluation failed");
      }
  
      const data = await response.json();
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setResults(data);
      }, 500);
  
    } catch (error) {
      clearInterval(interval);
      setLoading(false);
      alert("Error: " + error.message);
    }
  };

  const reset = () => { setFile(null); setResults(null); setActiveAnswer(0); setActiveTab("scores"); };

  const theme = darkMode ? {
    "--bg-primary": "#0a0a0f",
    "--bg-secondary": "#12121a",
    "--bg-card": "#1a1a26",
    "--bg-card-hover": "#22222f",
    "--bg-elevated": "#252533",
    "--text-primary": "#f0f0f5",
    "--text-secondary": "#8888a0",
    "--text-tertiary": "#55556a",
    "--accent": "#6366f1",
    "--accent-glow": "rgba(99,102,241,0.15)",
    "--accent-secondary": "#818cf8",
    "--border": "rgba(255,255,255,0.06)",
    "--border-subtle": "rgba(255,255,255,0.04)",
    "--error": "#f87171",
    "--error-bg": "rgba(248,113,113,0.08)",
    "--success": "#34d399",
    "--success-bg": "rgba(52,211,153,0.08)",
    "--warning": "#fbbf24",
    "--warning-bg": "rgba(251,191,36,0.08)",
    "--shadow": "0 8px 32px rgba(0,0,0,0.4)",
    "--font-display": "'Outfit', sans-serif",
    "--font-body": "'DM Sans', sans-serif",
    "--font-mono": "'JetBrains Mono', monospace",
  } : {
    "--bg-primary": "#f5f5f0",
    "--bg-secondary": "#eeeee8",
    "--bg-card": "#ffffff",
    "--bg-card-hover": "#fafaf7",
    "--bg-elevated": "#f0f0eb",
    "--text-primary": "#1a1a2e",
    "--text-secondary": "#6b7280",
    "--text-tertiary": "#9ca3af",
    "--accent": "#4f46e5",
    "--accent-glow": "rgba(79,70,229,0.08)",
    "--accent-secondary": "#6366f1",
    "--border": "rgba(0,0,0,0.08)",
    "--border-subtle": "rgba(0,0,0,0.04)",
    "--error": "#dc2626",
    "--error-bg": "rgba(220,38,38,0.06)",
    "--success": "#16a34a",
    "--success-bg": "rgba(22,163,74,0.06)",
    "--warning": "#d97706",
    "--warning-bg": "rgba(217,119,6,0.06)",
    "--shadow": "0 8px 32px rgba(0,0,0,0.08)",
    "--font-display": "'Outfit', sans-serif",
    "--font-body": "'DM Sans', sans-serif",
    "--font-mono": "'JetBrains Mono', monospace",
  };

  const answer = results?.answers[activeAnswer];

  return (
    <div style={{ ...theme, background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .glass-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; box-shadow: var(--shadow); backdrop-filter: blur(20px); }
        .hover-lift { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
        .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.15); }
        .tag { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; font-family: var(--font-mono); letter-spacing: 0.02em; }
        .tab-btn { padding: 8px 16px; border: none; background: transparent; color: var(--text-secondary); font-family: var(--font-body); font-size: 13px; font-weight: 600; cursor: pointer; border-radius: 8px; transition: all 0.2s; }
        .tab-btn.active { background: var(--accent); color: white; }
        .tab-btn:hover:not(.active) { background: var(--bg-elevated); color: var(--text-primary); }
        ::selection { background: var(--accent); color: white; }
      `}</style>

      {/* Ambient background */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, var(--accent-glow), transparent 70%)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.06), transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "20px 20px 60px" }}>

        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0 32px", animation: "fadeUp 0.6s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, var(--accent), #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📝</div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
                UPSC<span style={{ color: "var(--accent)" }}>Eval</span>
              </h1>
              <p style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>Mains Answer Evaluator</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {results && (
              <button onClick={reset} style={{ padding: "8px 16px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}>
                ← New Upload
              </button>
            )}
            <button onClick={() => setDarkMode(!darkMode)} style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-card)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        {/* Upload State */}
        {!loading && !results && (
          <div style={{ animation: "fadeUp 0.8s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <h2 style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 12 }}>
                Get your Mains answers<br /><span style={{ background: "linear-gradient(135deg, var(--accent), #a78bfa, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>evaluated by AI</span>
              </h2>
              <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
                Upload your handwritten or typed answer sheet. Get detailed scoring, factual error detection, and UPSC-specific improvement tips.
              </p>
            </div>

            <div className="glass-card hover-lift" onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); }}
              style={{ padding: 48, textAlign: "center", cursor: "pointer", border: dragActive ? "2px dashed var(--accent)" : "1px solid var(--border)", background: dragActive ? "var(--accent-glow)" : "var(--bg-card)", transition: "all 0.3s ease", maxWidth: 560, margin: "0 auto" }}>
              <input ref={fileRef} type="file" accept=".pdf" onChange={(e) => handleFile(e.target.files[0])} style={{ display: "none" }} />
              <div style={{ fontSize: 48, marginBottom: 16, animation: "float 3s ease-in-out infinite" }}>
                {file ? "📄" : "☁️"}
              </div>
              {file ? (
                <>
                  <p style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)", marginBottom: 4 }}>{file.name}</p>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{(file.size / 1024 / 1024).toFixed(2)} MB — Ready to evaluate</p>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-display)", marginBottom: 4 }}>Drop your answer sheet PDF here</p>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>or click to browse · PDF up to 20MB</p>
                </>
              )}
            </div>

            {file && (
              <div style={{ textAlign: "center", marginTop: 24, animation: "fadeUp 0.4s ease" }}>
                <button onClick={handleUpload} style={{ padding: "14px 40px", background: "linear-gradient(135deg, var(--accent), #818cf8)", color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-display)", letterSpacing: "0.01em", boxShadow: "0 4px 20px var(--accent-glow)", transition: "transform 0.2s" }}
                  onMouseEnter={(e) => e.target.style.transform = "scale(1.03)"}
                  onMouseLeave={(e) => e.target.style.transform = "scale(1)"}>
                  Evaluate My Answers →
                </button>
              </div>
            )}

            {/* Features */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 48 }}>
              {[
                { icon: "🔍", title: "OCR Extraction", desc: "Handwritten & typed PDF support with high-accuracy text extraction" },
                { icon: "📊", title: "Dimension-wise Scoring", desc: "Introduction, content, structure, keywords & conclusion scored separately" },
                { icon: "⚠️", title: "Factual Error Detection", desc: "Identifies incorrect facts and provides corrections with sources" },
                { icon: "🎯", title: "UPSC-Specific Tips", desc: "Keyword suggestions, case studies, diagram ideas & format guidance" },
              ].map((f, i) => (
                <div key={i} className="glass-card" style={{ padding: 20, animation: `fadeUp ${0.6 + i * 0.15}s ease` }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)", marginBottom: 4 }}>{f.title}</h3>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center", animation: "fadeUp 0.5s ease" }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{ width: 80, height: 80, margin: "0 auto 24px", borderRadius: 20, background: "var(--accent-glow)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
                <span style={{ animation: "spin 2s linear infinite", display: "inline-block" }}>⚙️</span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-display)", marginBottom: 8 }}>Analyzing your answers</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{loadingSteps[loadingStep]?.icon} {loadingSteps[loadingStep]?.text}</p>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "var(--border-subtle)", overflow: "hidden", marginBottom: 12 }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, var(--accent), #a78bfa)", borderRadius: 3, transition: "width 0.3s ease" }} />
            </div>
            <p style={{ fontSize: 12, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{Math.round(progress)}%</p>
          </div>
        )}

        {/* Results State */}
        {results && (
          <div style={{ animation: "fadeUp 0.6s ease" }}>
            {/* Summary Banner */}
            <div className="glass-card" style={{ padding: 28, marginBottom: 24, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
              <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
                <ScoreRing score={results.summary.totalScore} max={results.summary.totalMax} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)" }}>
                    <AnimatedScore value={results.summary.percentage} max={100} />
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Overall</span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                  {results.summary.strengths.slice(0, 2).map((s, i) => (
                    <span key={i} className="tag" style={{ background: "var(--success-bg)", color: "var(--success)" }}>✓ {s}</span>
                  ))}
                  {results.summary.weaknesses.slice(0, 2).map((w, i) => (
                    <span key={i} className="tag" style={{ background: "var(--error-bg)", color: "var(--error)" }}>✗ {w}</span>
                  ))}
                </div>
                <div style={{ padding: 12, background: "var(--accent-glow)", borderRadius: 10, borderLeft: "3px solid var(--accent)" }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-secondary)", marginBottom: 2, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Top Recommendation</p>
                  <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5 }}>{results.summary.topRecommendation}</p>
                </div>
              </div>
            </div>

            {/* Answer Selector */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
              {results.answers.map((a, i) => (
                <button key={i} onClick={() => { setActiveAnswer(i); setActiveTab("scores"); }}
                  className="hover-lift"
                  style={{ flex: "0 0 auto", padding: "12px 18px", borderRadius: 12, border: activeAnswer === i ? "2px solid var(--accent)" : "1px solid var(--border)", background: activeAnswer === i ? "var(--accent-glow)" : "var(--bg-card)", cursor: "pointer", textAlign: "left", minWidth: 180 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-tertiary)" }}>Q{i + 1}</span>
                    <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--font-display)", color: a.overallScore >= 7 ? "var(--success)" : a.overallScore >= 5 ? "var(--warning)" : "var(--error)" }}>
                      {a.overallScore}/{a.maxScore}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {a.question}
                  </p>
                </button>
              ))}
            </div>

            {/* Answer Detail */}
            {answer && (
              <div className="glass-card" style={{ overflow: "hidden" }}>
                {/* Question Header */}
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
                  <span className="tag" style={{ background: "var(--accent-glow)", color: "var(--accent)", marginBottom: 8, display: "inline-flex" }}>Question {activeAnswer + 1}</span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)", lineHeight: 1.4, marginTop: 6 }}>{answer.question}</h3>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 4, padding: "12px 24px", borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
                  {[
                    { id: "scores", label: "📊 Scores" },
                    { id: "errors", label: `⚠️ Errors (${answer.factualErrors.length})` },
                    { id: "improve", label: `🎯 Improve (${answer.improvements.length})` },
                    { id: "text", label: "📄 Extracted" },
                  ].map((tab) => (
                    <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id)}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div style={{ padding: 24 }}>
                  {/* Scores Tab */}
                  {activeTab === "scores" && (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                        <div style={{ position: "relative", width: 80, height: 80 }}>
                          <ScoreRing score={answer.overallScore} max={answer.maxScore} size={80} strokeWidth={6} />
                          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--font-display)" }}>{answer.overallScore}</span>
                          </div>
                        </div>
                        <div>
                          <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>Overall Score</p>
                          <p style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)" }}>{answer.overallScore} / {answer.maxScore}</p>
                        </div>
                      </div>
                      {answer.dimensions.map((d, i) => (
                        <ScoreBar key={i} score={d.score} max={d.max} label={d.name} comment={d.comment} delay={i * 100} />
                      ))}
                    </div>
                  )}

                  {/* Errors Tab */}
                  {activeTab === "errors" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {answer.factualErrors.length === 0 ? (
                        <div style={{ textAlign: "center", padding: 32 }}>
                          <p style={{ fontSize: 36, marginBottom: 8 }}>✅</p>
                          <p style={{ fontWeight: 600, fontFamily: "var(--font-display)" }}>No factual errors detected!</p>
                        </div>
                      ) : answer.factualErrors.map((err, i) => (
                        <div key={i} style={{ padding: 16, borderRadius: 12, border: "1px solid var(--border)", background: "var(--error-bg)", animation: `fadeUp ${0.3 + i * 0.15}s ease` }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                            <span style={{ fontSize: 16 }}>❌</span>
                            <div>
                              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--error)", marginBottom: 2, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Error Found</p>
                              <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.5 }}>{err.text}</p>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                            <span style={{ fontSize: 16 }}>✅</span>
                            <div>
                              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--success)", marginBottom: 2, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Correction</p>
                              <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.5 }}>{err.correction}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Improvements Tab */}
                  {activeTab === "improve" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {answer.improvements.map((imp, i) => (
                        <div key={i} style={{ display: "flex", gap: 12, padding: 14, borderRadius: 12, background: "var(--bg-secondary)", border: "1px solid var(--border)", animation: `fadeUp ${0.3 + i * 0.1}s ease` }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent-glow)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "var(--accent)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                            {i + 1}
                          </div>
                          <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-primary)" }}>{imp}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Extracted Text Tab */}
                  {activeTab === "text" && (
                    <div style={{ padding: 16, borderRadius: 12, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", marginBottom: 8, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em" }}>OCR Output</p>
                      <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--text-primary)", fontFamily: "var(--font-body)", whiteSpace: "pre-wrap" }}>{answer.extractedText}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
