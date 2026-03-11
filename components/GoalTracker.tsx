"use client";
import { useEffect, useState } from "react";

interface GoalTrackerProps {
  progress: number;
  current: number;
  target: number;
  year: number;
}

export default function GoalTracker({ progress, current, target, year }: GoalTrackerProps) {
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(Math.min(progress, 100)), 400);
    return () => clearTimeout(t);
  }, [progress]);

  const remaining = Math.max(0, target - current);
  // Full months remaining after current month (e.g. March → 9 months left: Apr–Dec)
  const monthsLeft = 12 - (new Date().getMonth() + 1);
  const neededPerMonth = monthsLeft > 0 ? remaining / monthsLeft : 0;
  const onTrack = neededPerMonth <= (current / Math.max(new Date().getMonth(), 1));

  // Segment markers at 25%, 50%, 75%
  const markers = [25, 50, 75];

  return (
    <div className="card animate-fade" style={{
      padding: "28px 32px",
      animationDelay: "250ms",
      animationFillMode: "both",
      opacity: 0,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Subtle background glow */}
      <div style={{
        position: "absolute",
        top: -40,
        right: -40,
        width: 200,
        height: 200,
        borderRadius: "50%",
        background: "var(--color-accent-dim)",
        filter: "blur(60px)",
        pointerEvents: "none",
      }} />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, position: "relative" }}>
        <div>
          <div className="label" style={{ marginBottom: 8 }}>Annual Target · {year}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <div className="metric-value" style={{ fontSize: 32, lineHeight: 1 }}>
              £{current.toLocaleString("en-GB", { maximumFractionDigits: 0 })}
            </div>
            <div style={{ fontSize: 14, color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
              / £{target.toLocaleString("en-GB", { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {/* Big % */}
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontSize: 52,
            fontFamily: "var(--font-mono), monospace",
            fontWeight: 500,
            color: "var(--color-accent)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}>
            {progress}
            <span style={{ fontSize: 28, color: "var(--color-accent)", opacity: 0.7 }}>%</span>
          </div>
          <div className="label" style={{ marginTop: 4 }}>of target</div>
        </div>
      </div>

      {/* Progress bar with markers */}
      <div style={{ position: "relative", marginBottom: 8 }}>
        {/* Marker lines */}
        {markers.map(m => (
          <div key={m} style={{
            position: "absolute",
            left: `${m}%`,
            top: 0,
            bottom: 0,
            width: 1,
            background: "var(--color-border-bright)",
            zIndex: 2,
          }} />
        ))}

        {/* Track */}
        <div style={{
          height: 8,
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
          borderRadius: 4,
          overflow: "hidden",
          position: "relative",
        }}>
          {/* Fill */}
          <div style={{
            height: "100%",
            width: `${barWidth}%`,
            background: `linear-gradient(90deg, var(--color-accent) 0%, #a5b4fc 100%)`,
            borderRadius: 4,
            transition: "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 0 12px rgba(129, 140, 248, 0.5)",
          }} />
        </div>

        {/* Marker labels */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          {markers.map(m => (
            <div key={m} style={{
              position: "absolute",
              left: `${m}%`,
              transform: "translateX(-50%)",
              fontSize: 9,
              color: "var(--color-text-dim)",
              letterSpacing: "0.06em",
              fontFamily: "var(--font-mono)",
            }}>{m}%</div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 28 }}>
        {[
          { label: "Remaining", value: `£${remaining.toLocaleString("en-GB", { maximumFractionDigits: 0 })}` },
          { label: "Needed / mo", value: neededPerMonth > 0 ? `£${neededPerMonth.toLocaleString("en-GB", { maximumFractionDigits: 0 })}` : "—" },
          { label: "Months left", value: `${monthsLeft}` },
          { label: "Status", value: progress >= 100 ? "Hit! 🎯" : onTrack ? "On track" : "Behind", highlight: progress >= 100 ? "green" : onTrack ? "green" : "red" },
        ].map(({ label, value, highlight }) => (
          <div key={label} style={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            borderRadius: 2,
            padding: "10px 14px",
          }}>
            <div className="label" style={{ marginBottom: 5 }}>{label}</div>
            <div style={{
              fontSize: 13,
              fontFamily: "var(--font-mono)",
              fontWeight: 500,
              color: highlight === "green" ? "var(--color-green)"
                : highlight === "red" ? "var(--color-red)"
                : "var(--color-text)",
            }}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
