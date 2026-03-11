"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { MonthlyData } from "@/lib/sheets";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{
      background: "var(--color-surface-2)",
      border: "1px solid var(--color-border-bright)",
      borderRadius: 2,
      padding: "10px 14px",
      fontFamily: "var(--font-mono), monospace",
    }}>
      <div className="label" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 13, color: "var(--color-text)" }}>
        {d.value} hrs
      </div>
    </div>
  );
}

export default function HoursChart({ data }: { data: MonthlyData[] }) {
  const maxHours = Math.max(...data.map(d => d.hours));

  return (
    <div className="card animate-fade" style={{
      padding: "24px",
      animationDelay: "300ms",
      animationFillMode: "both",
      opacity: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div className="label">Monthly Hours</div>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
            Bar chart · 2026
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barSize={16}>
          <CartesianGrid strokeDasharray="1 4" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="hours" radius={[1, 1, 0, 0]}>
            {data.map((d, i) => {
              const opacity = maxHours > 0 ? 0.4 + 0.6 * (d.hours / maxHours) : 0.4;
              return (
                <Cell
                  key={i}
                  fill="#818cf8"
                  fillOpacity={d.hours > 0 ? opacity : 0.15}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
