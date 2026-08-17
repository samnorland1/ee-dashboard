"use client";
import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

export interface TrendYear {
  year: number;
  total: number;
  hours: number;
  jobs: number;
  perHour: number;
  months: { month: string; earnings: number; hours: number; jobs: number }[];
}

const YEAR_COLORS: Record<number, string> = {
  2022: "#c084fc",
  2023: "#f97316",
  2024: "#3b82f6",
  2025: "#10b981",
  2026: "#818cf8",
};

const ALL_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmt(n: number) {
  return `£${n.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;
}

type MetricKey = "earnings" | "hours";

interface CompTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; stroke: string }>;
  label?: string;
  metric: MetricKey;
}

function ComparisonTooltip({ active, payload, label, metric }: CompTooltipProps) {
  if (!active || !payload?.length) return null;
  const visible = payload.filter(p => (p.value ?? 0) > 0);
  if (!visible.length) return null;
  return (
    <div style={{
      background: "var(--color-surface-2)",
      border: "1px solid var(--color-border-bright)",
      borderRadius: 2,
      padding: "10px 14px",
      fontFamily: "var(--font-mono), monospace",
      minWidth: 150,
    }}>
      <div className="label" style={{ marginBottom: 8 }}>{label}</div>
      {visible.map(p => (
        <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 12, marginBottom: 2 }}>
          <span style={{ color: p.stroke }}>{p.dataKey}</span>
          <span style={{ color: "var(--color-text)" }}>
            {metric === "earnings"
              ? `£${Number(p.value).toLocaleString("en-GB", { maximumFractionDigits: 0 })}`
              : `${p.value}h`}
          </span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  years: TrendYear[];
  lifetimeTotal: number;
  lifetimeTotalUSD: number;
  currentYear: number;
  currentMonthIdx: number;
}

export default function TrendsClient({ years, lifetimeTotal, lifetimeTotalUSD, currentYear, currentMonthIdx }: Props) {
  const [metric, setMetric] = useState<MetricKey>("earnings");

  if (years.length === 0) {
    return (
      <main style={{ flex: 1, padding: "32px" }} id="dashboard-main">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>
            Trends
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 12 }}>Long-term performance analysis</p>
        </div>
        <div className="card" style={{ padding: "60px 40px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>No historical data available</div>
        </div>
      </main>
    );
  }

  const bestYear = years.reduce((b, y) => y.total > b.total ? y : b, years[0]);
  const allMonthPoints = years.flatMap(y =>
    y.months.map(m => ({ year: y.year, month: m.month, earnings: m.earnings }))
  ).filter(m => m.earnings > 0);
  const bestMonth = allMonthPoints.length > 0
    ? allMonthPoints.reduce((b, m) => m.earnings > b.earnings ? m : b, allMonthPoints[0])
    : null;
  const curYearData = years.find(y => y.year === currentYear);
  const prevYearData = years.find(y => y.year === currentYear - 1);
  const rateChange = curYearData && prevYearData && prevYearData.perHour > 0 && curYearData.perHour > 0
    ? ((curYearData.perHour - prevYearData.perHour) / prevYearData.perHour) * 100
    : null;

  const monthChartData = ALL_MONTHS.map((month, monthIdx) => {
    const point: { [key: string]: number | string | null } = { month };
    for (const y of years) {
      const m = y.months.find(x => x.month === month);
      const isFuture = y.year === currentYear && monthIdx > currentMonthIdx;
      const val = metric === "earnings" ? (m?.earnings ?? 0) : (m?.hours ?? 0);
      // null for future months OR months with no activity — avoids flat £0 lines
      point[String(y.year)] = (isFuture || val === 0) ? null : val;
    }
    return point;
  });

  const annualData = years.map((y, i) => {
    const prev = years[i - 1];
    const growth = prev && prev.total > 0 ? ((y.total - prev.total) / prev.total) * 100 : null;
    return { year: String(y.year), total: Math.round(y.total), growth };
  });

  const rateData = years
    .filter(y => y.perHour > 0)
    .map(y => ({ year: String(y.year), rate: Math.round(y.perHour) }));

  const yearRange = years.length >= 2
    ? `${years[0].year} – ${years[years.length - 1].year}`
    : String(years[0]?.year ?? "");

  const tooltipStyle = {
    background: "var(--color-surface-2)",
    border: "1px solid var(--color-border-bright)",
    borderRadius: 2,
    padding: "10px 14px",
    fontFamily: "var(--font-mono), monospace",
  } as const;

  return (
    <main style={{ flex: 1, padding: "32px", overflowY: "auto" }} id="dashboard-main">
      {/* Header */}
      <div style={{ marginBottom: 32 }} className="animate-fade">
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>
            Trends
          </h1>
          <span className="tag tag-gold">{yearRange}</span>
        </div>
        <p style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
          Long-term performance · {years.length} year{years.length !== 1 ? "s" : ""} of data
        </p>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }} className="grid-4col">
        <div className="card accent-border animate-fade" style={{ padding: "20px 24px", animationDelay: "0ms", animationFillMode: "both", opacity: 0 }}>
          <div className="label" style={{ marginBottom: 10 }}>Career Earnings</div>
          <div className="metric-value" style={{ fontSize: 22, lineHeight: 1 }}>{fmt(lifetimeTotal)}</div>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 6 }}>
            ${(lifetimeTotalUSD / 1000).toFixed(0)}k USD · all time
          </div>
        </div>

        <div
          className="card accent-border animate-fade"
          style={{ padding: "20px 24px", animationDelay: "80ms", animationFillMode: "both", opacity: 0, borderLeftColor: YEAR_COLORS[bestYear.year] ?? "var(--color-accent)" }}
        >
          <div className="label" style={{ marginBottom: 10 }}>Best Year</div>
          <div className="metric-value" style={{ fontSize: 22, lineHeight: 1 }}>{fmt(bestYear.total)}</div>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 6 }}>{bestYear.year}</div>
        </div>

        <div
          className="card accent-border animate-fade"
          style={{ padding: "20px 24px", animationDelay: "160ms", animationFillMode: "both", opacity: 0, borderLeftColor: bestMonth ? (YEAR_COLORS[bestMonth.year] ?? "var(--color-accent)") : "var(--color-border)" }}
        >
          <div className="label" style={{ marginBottom: 10 }}>Best Month</div>
          <div className="metric-value" style={{ fontSize: 22, lineHeight: 1 }}>
            {bestMonth ? fmt(bestMonth.earnings) : "—"}
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 6 }}>
            {bestMonth ? `${bestMonth.month} ${bestMonth.year}` : "—"}
          </div>
        </div>

        <div className="card accent-border animate-fade" style={{ padding: "20px 24px", animationDelay: "240ms", animationFillMode: "both", opacity: 0 }}>
          <div className="label" style={{ marginBottom: 10 }}>Rate · {currentYear}</div>
          <div className="metric-value" style={{ fontSize: 22, lineHeight: 1 }}>
            {curYearData && curYearData.perHour > 0 ? `£${curYearData.perHour.toFixed(2)}/hr` : "—"}
          </div>
          <div style={{ marginTop: 8 }}>
            {rateChange !== null && (
              <span className={`tag ${rateChange >= 0 ? "tag-green" : "tag-red"}`}>
                {rateChange >= 0 ? "+" : ""}{rateChange.toFixed(1)}% YoY
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Multi-year comparison line chart */}
      <div className="card animate-fade" style={{ padding: 24, marginBottom: 12, animationDelay: "300ms", animationFillMode: "both", opacity: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div className="label">Year-over-Year Comparison</div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>All years overlaid · Jan – Dec</div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {(["earnings", "hours"] as MetricKey[]).map(m => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`btn${metric === m ? " btn-accent" : ""}`}
                style={{ fontSize: 10, padding: "4px 10px" }}
              >
                {m === "earnings" ? "£ Earnings" : "Hours"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, marginBottom: 16, flexWrap: "wrap" }}>
          {years.map(y => (
            <div key={y.year} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 22, height: 2, background: YEAR_COLORS[y.year] ?? "#818cf8", borderRadius: 1 }} />
              <span style={{ fontSize: 10, color: "var(--color-text-muted)", letterSpacing: "0.06em" }}>{y.year}</span>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={monthChartData} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
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
              tickFormatter={(v) => metric === "earnings" ? `£${(v / 1000).toFixed(0)}k` : `${v}h`}
            />
            <Tooltip content={<ComparisonTooltip metric={metric} />} />
            {years.map(y => (
              <Line
                key={y.year}
                type="linear"
                dataKey={String(y.year)}
                stroke={YEAR_COLORS[y.year] ?? "#818cf8"}
                strokeWidth={1.5}
                dot={{ r: 2.5, strokeWidth: 0, fill: YEAR_COLORS[y.year] ?? "#818cf8" }}
                activeDot={{ r: 4, strokeWidth: 0 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Annual revenue + Rate side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 8, marginBottom: 12 }} className="grid-2col">
        <div className="card animate-fade" style={{ padding: 24, animationDelay: "400ms", animationFillMode: "both", opacity: 0 }}>
          <div className="label" style={{ marginBottom: 16 }}>Annual Revenue</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={annualData} margin={{ top: 24, right: 8, left: -16, bottom: 0 }} barSize={32}>
              <CartesianGrid strokeDasharray="1 4" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="year"
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
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div style={tooltipStyle}>
                      <div className="label" style={{ marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text)" }}>
                        £{Number(payload[0]?.value ?? 0).toLocaleString("en-GB", { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="total" radius={[1, 1, 0, 0]}>
                {annualData.map(entry => (
                  <Cell
                    key={entry.year}
                    fill={YEAR_COLORS[Number(entry.year)] ?? "#818cf8"}
                    fillOpacity={Number(entry.year) === currentYear ? 1 : 0.65}
                  />
                ))}
                <LabelList
                  dataKey="growth"
                  position="top"
                  formatter={(v: unknown) => {
                    if (v == null) return "";
                    const n = Number(v);
                    return `${n >= 0 ? "+" : ""}${Math.round(n)}%`;
                  }}
                  style={{ fontSize: 9, fill: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card animate-fade" style={{ padding: 24, animationDelay: "500ms", animationFillMode: "both", opacity: 0 }}>
          <div className="label" style={{ marginBottom: 16 }}>Hourly Rate</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={rateData} margin={{ top: 24, right: 8, left: -16, bottom: 0 }} barSize={32}>
              <CartesianGrid strokeDasharray="1 4" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `£${v}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div style={tooltipStyle}>
                      <div className="label" style={{ marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text)" }}>
                        £{payload[0]?.value}/hr
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="rate" radius={[1, 1, 0, 0]}>
                {rateData.map(entry => (
                  <Cell
                    key={entry.year}
                    fill={YEAR_COLORS[Number(entry.year)] ?? "#818cf8"}
                    fillOpacity={Number(entry.year) === currentYear ? 1 : 0.65}
                  />
                ))}
                <LabelList
                  dataKey="rate"
                  position="top"
                  formatter={(v: unknown) => `£${v}`}
                  style={{ fontSize: 9, fill: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Year summary cards */}
      <div className="card animate-fade" style={{ padding: 24, animationDelay: "600ms", animationFillMode: "both", opacity: 0 }}>
        <div className="label" style={{ marginBottom: 20 }}>Year Summaries</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
          {[...years].reverse().map(y => {
            const prevYear = years.find(x => x.year === y.year - 1);
            const yoyChange = prevYear && prevYear.total > 0
              ? ((y.total - prevYear.total) / prevYear.total) * 100
              : null;
            const isCurrent = y.year === currentYear;
            const color = YEAR_COLORS[y.year] ?? "#818cf8";
            return (
              <div
                key={y.year}
                style={{
                  background: "var(--color-surface-2)",
                  border: `1px solid ${isCurrent ? "var(--color-border-bright)" : "var(--color-border)"}`,
                  borderTop: `2px solid ${color}`,
                  borderRadius: 2,
                  padding: "16px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color }}>{y.year}</div>
                  {isCurrent && <span className="tag tag-gold" style={{ fontSize: 9 }}>YTD</span>}
                </div>
                <div style={{ fontSize: 18, fontFamily: "var(--font-mono)", fontWeight: 500, marginBottom: 6, color: "var(--color-text)" }}>
                  {y.total > 0 ? fmt(y.total) : "—"}
                </div>
                {yoyChange !== null && (
                  <div style={{ marginBottom: 8 }}>
                    <span className={`tag ${yoyChange >= 0 ? "tag-green" : "tag-red"}`} style={{ fontSize: 9 }}>
                      {yoyChange >= 0 ? "+" : ""}{yoyChange.toFixed(1)}%
                    </span>
                  </div>
                )}
                <div style={{ fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.7 }}>
                  <div>{y.hours > 0 ? `${y.hours}h` : "—"} · {y.jobs > 0 ? `${y.jobs} jobs` : "—"}</div>
                  <div>{y.perHour > 0 ? `£${y.perHour.toFixed(2)}/hr` : "—"}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
