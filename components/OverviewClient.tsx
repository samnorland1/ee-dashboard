"use client";
import { useState } from "react";
import MetricCard from "@/components/MetricCard";
import EarningsChart from "@/components/EarningsChart";
import HoursChart from "@/components/HoursChart";
import GoalTracker from "@/components/GoalTracker";
import ClientBreakdown from "@/components/ClientBreakdown";
import MonthlyTable from "@/components/MonthlyTable";
import DashboardGrid from "@/components/DashboardGrid";
import type { DashboardData, MonthlyData, YearData } from "@/lib/sheets";

const YEARS = [2023, 2024, 2025, 2026] as const;
const YEAR_COLORS: Record<number, { color: string; bg: string; border: string }> = {
  2023: { color: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.35)" },
  2024: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.35)" },
  2025: { color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.35)" },
  2026: { color: "#818cf8", bg: "rgba(129,140,248,0.12)", border: "rgba(129,140,248,0.35)" },
};

const ALL_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function mergeYearData(year: number, historical: YearData[]): {
  monthly: MonthlyData[];
  bankTotal: number;
  bankTotalUSD: number;
  totalHours: number;
  perHour: number;
  jobs: number;
} {
  const h1 = historical.find(h => h.year === year && h.half === "H1");
  const h2 = historical.find(h => h.year === year && h.half === "H2");
  const allMonths = [...(h1?.months ?? []), ...(h2?.months ?? [])];

  const monthly: MonthlyData[] = ALL_MONTHS.map(m => {
    const found = allMonths.find(x => x.month === m);
    return { month: m, earnings: found?.earnings ?? 0, hours: found?.hours ?? 0, jobs: found?.jobs ?? 0, investment: 0 };
  });

  const bankTotal = (h1?.bankTotal ?? 0) + (h2?.bankTotal ?? 0);
  const bankTotalUSD = (h1?.bankTotalUSD ?? 0) + (h2?.bankTotalUSD ?? 0);
  const totalHours = (h1?.hours ?? 0) + (h2?.hours ?? 0);
  const jobs = (h1?.jobs ?? 0) + (h2?.jobs ?? 0);
  const perHour = totalHours > 0 ? bankTotal / totalHours : 0;

  return { monthly, bankTotal, bankTotalUSD, totalHours, perHour, jobs };
}

interface Props {
  data: DashboardData;
}

export default function OverviewClient({ data }: Props) {
  const { summary, monthly: currentMonthly, averages, investment, historical } = data;
  const currentYear = new Date().getFullYear();
  const curMonthIdx = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Resolve data for selected year
  const isCurrentYear = selectedYear === currentYear;
  const yearMonthly = isCurrentYear
    ? currentMonthly
    : mergeYearData(selectedYear, historical).monthly;

  const yearStats = isCurrentYear
    ? { bankTotal: summary.bankTotal, bankTotalUSD: summary.bankTotalUSD, totalHours: summary.totalHours, perHour: summary.perHour }
    : mergeYearData(selectedYear, historical);

  // Elapsed months for avg calculation
  const elapsedSlice = isCurrentYear
    ? yearMonthly.slice(0, curMonthIdx + 1)
    : yearMonthly; // full year for past years

  const activeMonths = elapsedSlice.filter(m => m.earnings > 0);
  const computedAvgPerMonth = activeMonths.length > 0
    ? activeMonths.reduce((s, m) => s + m.earnings, 0) / activeMonths.length
    : averages.perMonth;

  const accentColor = YEAR_COLORS[selectedYear]?.color ?? "#818cf8";

  // Last 12 months (current year only — keep existing logic)
  const H1_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const last12Current = currentMonthly.slice(0, curMonthIdx + 1).reduce((s, m) => s + m.earnings, 0);
  const prevH1 = historical.find(h => h.year === 2025 && h.half === "H1");
  const prevH2 = historical.find(h => h.year === 2025 && h.half === "H2");
  const last12PrevH1 = (prevH1?.months ?? []).filter(m => H1_MONTHS.indexOf(m.month) > curMonthIdx).reduce((s, m) => s + m.earnings, 0);
  const last12PrevH2 = (prevH2?.months ?? []).reduce((s, m) => s + m.earnings, 0);
  const last12Total = last12Current + last12PrevH1 + last12PrevH2;
  const priorH1_2025 = (prevH1?.months ?? []).filter(m => H1_MONTHS.indexOf(m.month) <= curMonthIdx).reduce((s, m) => s + m.earnings, 0);
  const priorH2_2024 = historical.find(h => h.year === 2024 && h.half === "H2");
  const priorH1_2024 = historical.find(h => h.year === 2024 && h.half === "H1");
  const prior12PrevH1 = (priorH1_2024?.months ?? []).filter(m => H1_MONTHS.indexOf(m.month) > curMonthIdx).reduce((s, m) => s + m.earnings, 0);
  const prior12PrevH2 = (priorH2_2024?.months ?? []).reduce((s, m) => s + m.earnings, 0);
  const prior12Total = priorH1_2025 + prior12PrevH1 + prior12PrevH2;
  const last12YoY = prior12Total > 0 ? ((last12Total - prior12Total) / prior12Total) * 100 : undefined;

  // Year-on-year comparison for selected year vs prior year
  const priorYearStats = selectedYear > 2023 ? mergeYearData(selectedYear - 1, historical) : null;
  const yearTotalEarnings = isCurrentYear ? summary.bankTotal : yearStats.bankTotal;
  const priorYearEarnings = priorYearStats?.bankTotal ?? 0;
  const yearYoY = priorYearEarnings > 0 ? ((yearTotalEarnings - priorYearEarnings) / priorYearEarnings) * 100 : undefined;

  const kpiRow1 = (
    <div className="grid-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
      <MetricCard
        label={`Bank Total · ${selectedYear}`}
        value={`£${yearTotalEarnings.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`}
        sub={`$${yearStats.bankTotalUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
        change={yearYoY}
        changeLabel="YoY"
        accent
        delay={0}
      />
      <MetricCard label="Avg Earnings / Month" value={`£${computedAvgPerMonth.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`} delay={50} />
      <MetricCard label="Rate / Hour" value={`£${yearStats.perHour.toFixed(2)}`} sub={`${yearStats.totalHours}h total`} delay={100} />
      <MetricCard label="Avg Hours / Month" value={`${averages.hoursPerMonth}h`} sub="Avg per active month" delay={150} />
    </div>
  );

  const kpiRow2 = (
    <div className="grid-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
      <MetricCard label="Freelancing Lifetime" value={`£${(summary.freelancingLifetime / 1000).toFixed(1)}k`} sub={`$${(summary.freelancingLifetimeUSD / 1000).toFixed(1)}k USD`} delay={200} />
      <MetricCard label={`Year Turnover · ${selectedYear}`} value={`£${(isCurrentYear ? summary.yearTurnoverTotal : yearStats.bankTotal).toLocaleString("en-GB", { maximumFractionDigits: 0 })}`} delay={250} />
      <MetricCard label="Investment Pool (20%)" value={`£${investment.total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`} sub="Reinvestment fund" delay={300} />
      <MetricCard
        label="Last 12 Months"
        value={`£${last12Total.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`}
        sub={prior12Total > 0 ? `vs £${prior12Total.toLocaleString("en-GB", { maximumFractionDigits: 0 })} prior` : "Apr 2025 – Mar 2026"}
        change={last12YoY}
        changeLabel="YoY"
        delay={350}
      />
    </div>
  );

  const goalTile = isCurrentYear ? (
    <GoalTracker
      progress={summary.targetProgress}
      current={summary.bankTotal}
      target={summary.targetAmount}
      year={summary.targetYear}
    />
  ) : null;

  const chartsRow = (
    <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
      <EarningsChart data={yearMonthly} />
      <HoursChart data={yearMonthly} />
    </div>
  );

  const bottomRow = (
    <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
      <MonthlyTable data={yearMonthly} />
      <ClientBreakdown data={data} />
    </div>
  );

  const tiles = [
    { id: "kpi-row-1", node: kpiRow1 },
    { id: "kpi-row-2", node: kpiRow2 },
    ...(goalTile ? [{ id: "goal", node: goalTile }] : []),
    { id: "charts", node: chartsRow },
    { id: "bottom", node: bottomRow },
  ];

  return (
    <>
      {/* Year tabs */}
      <div className="year-tabs-row" style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {YEARS.map(year => {
          const active = year === selectedYear;
          const c = YEAR_COLORS[year];
          return (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 12,
                fontWeight: active ? 600 : 400,
                letterSpacing: "0.06em",
                padding: "7px 20px",
                borderRadius: 3,
                border: `1px solid ${active ? c.border : "var(--color-border)"}`,
                background: active ? c.bg : "transparent",
                color: active ? c.color : "var(--color-text-muted)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                position: "relative",
              }}
            >
              {year}
              {year === currentYear && (
                <span style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: accentColor,
                  opacity: active ? 1 : 0.4,
                }} />
              )}
            </button>
          );
        })}
        <div className="live-label" style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          color: "var(--color-text-dim)",
          fontFamily: "var(--font-mono)",
          flexShrink: 0,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: YEAR_COLORS[selectedYear].color, display: "inline-block" }} />
          {selectedYear === currentYear ? "Live · current year" : `Historical · ${selectedYear}`}
        </div>
      </div>

      <DashboardGrid tiles={tiles} />
    </>
  );
}
