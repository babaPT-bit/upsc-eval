"use client";
import { useState, useEffect, useRef } from "react";

interface CountdownTimerProps {
  seconds: number;
  onExpire?: () => void;
  paused?: boolean;
}

export default function CountdownTimer({ seconds, onExpire, paused = false }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (paused || remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(id);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [paused, seconds]); // re-run when seconds (question) changes

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const display = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  const isWarning = remaining <= 60 && remaining > 0;
  const isDone = remaining === 0;

  return (
    <span style={{
      fontFamily: "var(--font-mono)",
      fontSize: 14,
      fontWeight: 600,
      color: isDone ? "var(--danger)" : isWarning ? "var(--warning)" : "var(--ink-muted)",
      letterSpacing: "0.04em",
      tabularNums: "tabular-nums",
    } as React.CSSProperties}>
      {display}
    </span>
  );
}
