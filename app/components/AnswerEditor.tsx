"use client";
import { useRef } from "react";

export type AnswerMode = "type" | "upload";

interface AnswerEditorProps {
  mode: AnswerMode;
  onModeChange: (m: AnswerMode) => void;
  typedValue: string;
  onTypedChange: (v: string) => void;
  file: File | null;
  onFileChange: (f: File | null) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function AnswerEditor({
  mode, onModeChange, typedValue, onTypedChange, file, onFileChange,
  placeholder = "Write your answer here…",
  minHeight = 200,
}: AnswerEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      {/* Mode tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {(["type", "upload"] as AnswerMode[]).map(m => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            style={{
              padding: "6px 14px",
              borderRadius: 4,
              border: `1px solid ${mode === m ? "var(--accent)" : "var(--hairline)"}`,
              background: mode === m ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
              color: mode === m ? "var(--accent)" : "var(--ink-muted)",
              fontSize: 13,
              fontFamily: "inherit",
              cursor: "pointer",
              fontWeight: mode === m ? 500 : 400,
            }}
          >
            {m === "type" ? "Write" : "Upload PDF"}
          </button>
        ))}
      </div>

      {mode === "type" ? (
        <textarea
          value={typedValue}
          onChange={e => onTypedChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            minHeight,
            padding: "14px 16px",
            border: "1px solid var(--hairline)",
            borderRadius: 6,
            background: "var(--surface)",
            color: "var(--ink)",
            fontSize: 14,
            fontFamily: "inherit",
            lineHeight: 1.75,
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: "2px dashed var(--hairline)",
            borderRadius: 6,
            padding: "40px 24px",
            textAlign: "center",
            cursor: "pointer",
            minHeight,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--ink-faint)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: file ? "var(--ink)" : "var(--ink-faint)" }}>
            {file ? file.name : "Click to upload PDF answer sheet"}
          </div>
          {file && (
            <button
              onClick={e => { e.stopPropagation(); onFileChange(null); }}
              style={{ fontSize: 11, color: "var(--ink-faint)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              Remove
            </button>
          )}
          <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => onFileChange(e.target.files?.[0] ?? null)} />
        </div>
      )}
    </div>
  );
}
