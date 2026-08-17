import Sidebar from "@/components/Sidebar";
import { getAllDashboardData } from "@/lib/sheets";
import TrendsClient from "@/components/TrendsClient";
import type { TrendYear } from "@/components/TrendsClient";

export const revalidate = 3600;

const ALL_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default async function TrendsPage() {
  const data = await getAllDashboardData();
  const { monthly, historical, summary } = data;

  type YearBuild = {
    year: number;
    total: number;
    hours: number;
    jobs: number;
    monthsMap: Record<string, { earnings: number; hours: number; jobs: number }>;
  };

  const yearMap: Record<number, YearBuild> = {};

  const getY = (year: number): YearBuild => {
    if (!yearMap[year]) yearMap[year] = { year, total: 0, hours: 0, jobs: 0, monthsMap: {} };
    return yearMap[year];
  };

  const addMonth = (year: number, month: string, earnings: number, hours: number, jobs: number) => {
    const y = getY(year);
    if (!y.monthsMap[month]) y.monthsMap[month] = { earnings: 0, hours: 0, jobs: 0 };
    y.monthsMap[month].earnings += earnings;
    y.monthsMap[month].hours += hours;
    y.monthsMap[month].jobs += jobs;
  };

  // Historical tabs (includes 2026 Q1-Q2 if it exists)
  for (const tab of historical) {
    const y = getY(tab.year);
    y.total += tab.bankTotal;
    y.hours += tab.hours;
    y.jobs += tab.jobs;
    for (const m of tab.months) addMonth(tab.year, m.month, m.earnings, m.hours, m.jobs);
  }

  // Current period (2026 Q3-Q4)
  const CY = 2026;
  const cy = getY(CY);
  cy.total += summary.bankTotal;
  cy.hours += summary.totalHours;
  for (const m of monthly) {
    if (m.earnings > 0 || m.hours > 0 || m.jobs > 0) {
      cy.jobs += m.jobs;
      addMonth(CY, m.month, m.earnings, m.hours, m.jobs);
    }
  }

  const trendYears: TrendYear[] = Object.values(yearMap)
    .map(y => ({
      year: y.year,
      total: y.total,
      hours: y.hours,
      jobs: y.jobs,
      perHour: y.hours > 0 ? y.total / y.hours : 0,
      months: ALL_MONTHS.map(month => ({
        month,
        earnings: y.monthsMap[month]?.earnings ?? 0,
        hours: y.monthsMap[month]?.hours ?? 0,
        jobs: y.monthsMap[month]?.jobs ?? 0,
      })),
    }))
    .filter(y => y.total > 0)
    .sort((a, b) => a.year - b.year);

  const now = new Date();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <TrendsClient
        years={trendYears}
        lifetimeTotal={summary.freelancingLifetime}
        lifetimeTotalUSD={summary.freelancingLifetimeUSD}
        currentYear={CY}
        currentMonthIdx={now.getMonth()}
      />
    </div>
  );
}
