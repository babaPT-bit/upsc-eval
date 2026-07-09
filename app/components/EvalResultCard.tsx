"use client";

export interface ResultDimension {
  name: string;
  score: number;
  max: number;
  comment?: string;
}

export type Improvement = string | { action_type?: string; message: string };
export function improvementText(item: Improvement): string {
  return typeof item === "string" ? item : (item?.message ?? "");
}

export interface EvalResultData {
  percentage: number;
  overallScore: number;
  maxScore: number;
  examinerVerdict?: string;
  dimensions: ResultDimension[];
  improvements?: Improvement[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapToEvalResult(data: any, fallbackMaxScore = 10): EvalResultData {
  const answer = data?.answers?.[0];
  const evaluation = answer?.evaluation || data?.evaluation || data || {};

  // New shape: answer.dimensions[] is already fully formed ({name,key,score,max,comment}),
  // data-driven across both the GS and Essay dimension sets. Prefer it.
  const dimensions: ResultDimension[] = [];
  if (Array.isArray(answer?.dimensions) && answer.dimensions.length > 0) {
    for (const d of answer.dimensions) {
      dimensions.push({ name: d.name, score: d.score ?? 0, max: d.max ?? 10, comment: d.comment ?? "" });
    }
  } else {
    const dimKeys: Record<string, string> = {
      question_comprehension: "Question Comprehension",
      factual_accuracy: "Factual Accuracy",
      syllabus_alignment: "Syllabus Alignment",
      current_affairs: "Current Affairs",
      answer_structure: "Answer Structure",
      point_density: "Point Density",
      presentation: "Presentation",
    };
    for (const [key, label] of Object.entries(dimKeys)) {
      const d = evaluation[key];
      if (d) dimensions.push({ name: label, score: d.score ?? 0, max: 10, comment: d.comment ?? "" });
    }
  }

  const overall = answer?.overallScore ?? evaluation.overall_score ?? 0;
  const max = answer?.maxScore ?? fallbackMaxScore;
  const pct = evaluation.overall_percentage ?? data?.summary?.percentage ??
    (max > 0 ? Math.round((overall / max) * 100) : 0);

  return {
    percentage: pct,
    overallScore: overall,
    maxScore: max,
    examinerVerdict: evaluation.examiner_verdict ?? "",
    dimensions,
    improvements: evaluation.top_3_improvements ?? answer?.improvements ?? [],
  };
}

function pctColor(p: number) {
  return p >= 75 ? "var(--success)" : p >= 50 ? "var(--warning)" : "var(--danger)";
}

interface EvalResultCardProps {
  result: EvalResultData;
  compact?: boolean;
}

export default function EvalResultCard({ result, compact = false }: EvalResultCardProps) {
  const { percentage, overallScore, maxScore, examinerVerdict, dimensions, improvements } = result;

  return (
    <div style={{ border: "1px solid var(--hairline)", borderRadius: 6, background: "var(--surface)", overflow: "hidden" }}>
      {/* Score row */}
      <div style={{ padding: compact ? "16px 20px" : "20px 24px", borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "center", gap: 20 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: compact ? 32 : 42, fontWeight: 700, color: pctColor(percentage), lineHeight: 1 }}>
          {percentage}%
        </span>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--ink-muted)" }}>
            {overallScore} <span style={{ color: "var(--ink-faint)" }}>/ {maxScore}</span>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginTop: 2 }}>Score</div>
        </div>
      </div>

      {/* Examiner verdict */}
      {examinerVerdict && (
        <div style={{ padding: compact ? "12px 20px" : "16px 24px", borderBottom: "1px solid var(--hairline)" }}>
          <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.7, fontStyle: "italic" }}>
            &ldquo;{examinerVerdict}&rdquo;
          </p>
        </div>
      )}

      {/* Dimensions */}
      {dimensions.length > 0 && (
        <div style={{ padding: compact ? "12px 20px" : "16px 24px", borderBottom: improvements && improvements.length > 0 ? "1px solid var(--hairline)" : "none" }}>
          {dimensions.slice(0, compact ? 4 : dimensions.length).map(d => (
            <div key={d.name} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>{d.name}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)" }}>{d.score}/{d.max}</span>
              </div>
              <div style={{ height: 3, background: "var(--hairline)", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${(d.score / d.max) * 100}%`, background: pctColor(Math.round((d.score / d.max) * 100)), borderRadius: 2 }} />
              </div>
              {!compact && d.comment && (
                <p style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 4, lineHeight: 1.5 }}>{d.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Improvements */}
      {!compact && improvements && improvements.length > 0 && (
        <div style={{ padding: "16px 24px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)", marginBottom: 10 }}>Top improvements</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {improvements.slice(0, 3).map((imp, i) => (
              <li key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", marginTop: 1, flexShrink: 0 }}>{i + 1}.</span>
                <span style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6 }}>{improvementText(imp)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
