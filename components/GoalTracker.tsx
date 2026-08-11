"use client";
import { useEffect, useState } from "react";

interface GoalTrackerProps {
  progress: number;
  current: number;
  target: number;
  year: number;
  projected: number;
  priorYearTotal: number;
  priorYear: number;
}

export default function GoalTracker({ progress, current, target, year, projected, priorYearTotal, priorYear }: GoalTrackerProps) {
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(Math.min(progress, 100)), 400);
    return () => clearTimeout(t);
  }, [progress]);

  const remaining = Math.max(0, target - current);
  const monthsLeft = 12 - (new Date().getMonth() + 1);
  const neededPerMonth = monthsLeft > 0 ? remaining / monthsLeft : 0;
  const onTrack = neededPerMonth <= (current / Math.max(new Date().getMonth(), 1));

  const projectedDelta = priorYearTotal > 0 ? projected - priorYearTotal : 0;
  const projectedPct = priorYearTotal > 0 ? (projectedDelta / priorYearTotal) * 100 : 0;
  const projectedUp = projectedDelta >= 0;

  const markers = [25, 50, 75];

  const statBox = (label: string, value: string, highlight?: "green" | "red") => (
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
  );

  return (
    <div className="card animate-fade" style={{
      padding: "28px 32px",
      animationDelay: "250ms",
      animationFillMode: "both",
      opacity: 0,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Glow on right side behind projection number */}
      <div style={{
        position: "absolute",
        top: -40,
        right: -40,
        width: 220,
        height: 220,
        borderRadius: "50%",
        background: "var(--color-accent-dim)",
        filter: "blur(60px)",
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", gap: 32, position: "relative" }}>

        {/* ── LEFT: current progress ── */}
        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          <div className="label" style={{ marginBottom: 8 }}>Annual Target · {year}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 20 }}>
            <div className="metric-value" style={{ fontSize: 30, lineHeight: 1 }}>
              £{current.toLocaleString("en-GB", { maximumFractionDigits: 0 })}
            </div>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
              / £{target.toLocaleString("en-GB", { maximumFractionDigits: 0 })}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ position: "relative", marginBottom: 20 }}>
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
            <div style={{
              height: 8,
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              borderRadius: 4,
              overflow: "hidden",
              position: "relative",
            }}>
              <div style={{
                height: "100%",
                width: `${barWidth}%`,
                background: "linear-gradient(90deg, var(--color-accent) 0%, #a5b4fc 100%)",
                borderRadius: 4,
                transition: "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 0 12px rgba(129, 140, 248, 0.5)",
              }} />
            </div>
            <div style={{ position: "relative", height: 16 }}>
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

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {statBox("Remaining", `£${remaining.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`)}
            {statBox("Needed / mo", neededPerMonth > 0 ? `£${neededPerMonth.toLocaleString("en-GB", { maximumFractionDigits: 0 })}` : "—")}
            {statBox("Months left", `${monthsLeft}`)}
            {statBox("Status", progress >= 100 ? "Hit! 🎯" : onTrack ? "On track" : "Behind", progress >= 100 ? "green" : onTrack ? "green" : "red")}
          </div>
        </div>

        {/* Divider */}
        <div style={{
          width: 1,
          background: "var(--color-border)",
          alignSelf: "stretch",
          flexShrink: 0,
        }} />

        {/* ── RIGHT: projection ── */}
        <div style={{ flex: "0 0 220px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", textAlign: "right" }}>
          <div className="label" style={{ marginBottom: 10 }}>Projected Year-End</div>
          <div style={{
            fontSize: 48,
            fontFamily: "var(--font-mono), monospace",
            fontWeight: 500,
            color: "var(--color-accent)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
            marginBottom: 12,
          }}>
            £{projected.toLocaleString("en-GB", { maximumFractionDigits: 0 })}
          </div>

          {priorYearTotal > 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <div className="label">vs {priorYear}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 14, fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
                  £{priorYearTotal.toLocaleString("en-GB", { maximumFractionDigits: 0 })}
                </span>
                <span style={{
                  fontSize: 13,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                  color: projectedUp ? "var(--color-green)" : "var(--color-red)",
                }}>
                  {projectedUp ? "↑" : "↓"}{Math.abs(projectedPct).toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {/* % of target below */}
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{
              fontSize: 28,
              fontFamily: "var(--font-mono), monospace",
              fontWeight: 500,
              color: "var(--color-accent)",
              opacity: 0.5,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}>
              {progress}<span style={{ fontSize: 16 }}>%</span>
            </div>
            <div className="label" style={{ marginTop: 3 }}>of target</div>
          </div>
        </div>

      </div>
    </div>
  );
}
