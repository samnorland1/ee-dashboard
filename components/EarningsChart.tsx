"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { MonthlyData } from "@/lib/sheets";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--color-surface-2)",
      border: "1px solid var(--color-border-bright)",
      borderRadius: 2,
      padding: "10px 14px",
      fontFamily: "var(--font-mono), monospace",
    }}>
      <div className="label" style={{ marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ fontSize: 13, color: "var(--color-text)" }}>
          £{p.value.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
        </div>
      ))}
    </div>
  );
}

export default function EarningsChart({ data }: { data: MonthlyData[] }) {
  const chartData = data.filter(d => d.earnings > 0);
  const avg = chartData.reduce((s, d) => s + d.earnings, 0) / chartData.length;

  return (
    <div className="card animate-fade" style={{
      padding: "24px",
      animationDelay: "200ms",
      animationFillMode: "both",
      opacity: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div className="label">Monthly Earnings</div>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
            Area chart · 2026
          </div>
        </div>
        <span className="tag tag-gold">Avg £{avg.toLocaleString("en-GB", { maximumFractionDigits: 0 })}/mo</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="1 4"
            stroke="var(--color-border)"
            vertical={false}
          />
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
            tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={avg}
            stroke="var(--color-accent)"
            strokeDasharray="3 6"
            strokeOpacity={0.4}
          />
          <Area
            type="monotone"
            dataKey="earnings"
            stroke="#818cf8"
            strokeWidth={1.5}
            fill="url(#earningsGrad)"
            dot={{ fill: "#818cf8", r: 3, strokeWidth: 0 }}
            activeDot={{ r: 4, fill: "#818cf8" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
