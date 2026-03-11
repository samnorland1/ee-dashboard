"use client";

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  change?: number;
  changeLabel?: string;
  accent?: boolean;
  delay?: number;
}

export default function MetricCard({ label, value, sub, change, changeLabel = "MoM", accent, delay = 0 }: MetricCardProps) {
  return (
    <div
      className="card accent-border animate-fade"
      style={{
        padding: "20px 24px",
        animationDelay: `${delay}ms`,
        animationFillMode: "both",
        opacity: 0,
        borderLeftColor: accent ? "var(--color-accent)" : "var(--color-border)",
      }}
    >
      <div className="label" style={{ marginBottom: 10 }}>{label}</div>
      <div
        className="metric-value"
        style={{ fontSize: accent ? 28 : 22, lineHeight: 1 }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 8, fontFamily: "var(--font-mono)" }}>
          {sub}
        </div>
      )}
      {change !== undefined && (
        <div style={{ marginTop: 8 }}>
          <span className={`tag ${change >= 0 ? "tag-green" : "tag-red"}`}>
            {change >= 0 ? "+" : ""}{change.toFixed(1)}% {changeLabel}
          </span>
        </div>
      )}
    </div>
  );
}
