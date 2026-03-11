import Sidebar from "@/components/Sidebar";
import { getAllDashboardData } from "@/lib/sheets";

export const revalidate = 300;

export default async function ReportsPage() {
  const data = await getAllDashboardData();
  const { monthly, historical } = data;

  // Group historical by year (combine H1 + H2)
  const yearMap: Record<number, { total: number; h1: number; h2: number; hours: number; jobs: number }> = {};
  for (const tab of historical) {
    if (!yearMap[tab.year]) yearMap[tab.year] = { total: 0, h1: 0, h2: 0, hours: 0, jobs: 0 };
    yearMap[tab.year].total += tab.bankTotal;
    yearMap[tab.year].hours += tab.hours;
    yearMap[tab.year].jobs += tab.jobs;
    if (tab.half === "H1") yearMap[tab.year].h1 += tab.bankTotal;
    if (tab.half === "H2") yearMap[tab.year].h2 += tab.bankTotal;
  }

  // Add 2026 current data
  const currentYearTotal = monthly.reduce((s, m) => s + m.earnings, 0);
  yearMap[2026] = {
    total: currentYearTotal,
    h1: currentYearTotal,
    h2: 0,
    hours: monthly.reduce((s, m) => s + m.hours, 0),
    jobs: monthly.reduce((s, m) => s + m.jobs, 0),
  };

  const years = Object.entries(yearMap)
    .map(([year, d]) => ({ year: Number(year), ...d }))
    .sort((a, b) => b.year - a.year);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
        <div style={{ marginBottom: 32 }} className="animate-fade">
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>
              Reports
            </h1>
            <span className="tag tag-gold">2026</span>
          </div>
          <p style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
            Month-on-month · Year-on-year · All data from Google Sheets
          </p>
        </div>

        {/* MoM cards */}
        <div className="card animate-fade" style={{ padding: 24, marginBottom: 12, animationDelay: "100ms", animationFillMode: "both", opacity: 0 }}>
          <div className="label" style={{ marginBottom: 20 }}>Month-on-Month · 2026 H1</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
            {monthly.map((m, i) => {
              const prev = i > 0 ? monthly[i - 1] : null;
              const change = prev && prev.earnings > 0 && m.earnings > 0
                ? ((m.earnings - prev.earnings) / prev.earnings) * 100 : null;
              const isActive = m.earnings > 0;
              return (
                <div key={m.month} style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 2,
                  padding: "16px 14px",
                  opacity: isActive ? 1 : 0.3,
                }}>
                  <div className="label" style={{ marginBottom: 8 }}>{m.month}</div>
                  <div style={{ fontSize: 15, fontFamily: "var(--font-mono)", fontWeight: 500, marginBottom: 4 }}>
                    {isActive ? `£${(m.earnings / 1000).toFixed(1)}k` : "—"}
                  </div>
                  {change !== null && (
                    <span className={`tag ${change >= 0 ? "tag-green" : "tag-red"}`} style={{ fontSize: 9 }}>
                      {change >= 0 ? "+" : ""}{change.toFixed(0)}%
                    </span>
                  )}
                  {isActive && (
                    <div style={{ marginTop: 8, fontSize: 10, color: "var(--color-text-muted)" }}>
                      {m.jobs} jobs · {m.hours}h
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* YoY Table */}
        <div className="card animate-fade" style={{ padding: 24, marginBottom: 12, animationDelay: "200ms", animationFillMode: "both", opacity: 0 }}>
          <div className="label" style={{ marginBottom: 20 }}>Year-on-Year Summary</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Year", "H1 Earnings", "H2 Earnings", "Full Year", "vs Prior Year", "Hours", "Jobs", "£/hr"].map(h => (
                  <th key={h} style={{
                    textAlign: "left", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                    color: "var(--color-text-dim)", paddingBottom: 12, fontWeight: 400,
                    fontFamily: "var(--font-mono)", borderBottom: "1px solid var(--color-border)",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {years.map((yr, i) => {
                const prior = years[i + 1];
                const yoyChange = prior && prior.total > 0 ? ((yr.total - prior.total) / prior.total) * 100 : null;
                const isCurrent = yr.year === 2026;
                const effectivePerHour = yr.hours > 0 && yr.total > 0 ? yr.total / yr.hours : 0;
                return (
                  <tr key={yr.year} style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "12px 0", fontFamily: "var(--font-mono)", fontSize: 13, color: isCurrent ? "var(--color-accent)" : "var(--color-text)", fontWeight: isCurrent ? 500 : 400 }}>
                      {yr.year}{isCurrent && <span className="tag tag-gold" style={{ fontSize: 9, marginLeft: 6 }}>current</span>}
                    </td>
                    <td style={{ padding: "12px 0", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text)" }}>
                      {yr.h1 > 0 ? `£${yr.h1.toLocaleString("en-GB", { maximumFractionDigits: 0 })}` : "—"}
                    </td>
                    <td style={{ padding: "12px 0", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-muted)" }}>
                      {yr.h2 > 0 ? `£${yr.h2.toLocaleString("en-GB", { maximumFractionDigits: 0 })}` : isCurrent ? <span style={{ color: "var(--color-text-dim)" }}>in progress</span> : "—"}
                    </td>
                    <td style={{ padding: "12px 0", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-text)", fontWeight: 500 }}>
                      {yr.total > 0 ? `£${yr.total.toLocaleString("en-GB", { maximumFractionDigits: 0 })}` : "—"}
                    </td>
                    <td style={{ padding: "12px 0" }}>
                      {yoyChange !== null ? (
                        <span className={`tag ${yoyChange >= 0 ? "tag-green" : "tag-red"}`}>
                          {yoyChange >= 0 ? "+" : ""}{yoyChange.toFixed(1)}%
                        </span>
                      ) : <span style={{ color: "var(--color-text-dim)", fontSize: 11 }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 0", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-muted)" }}>
                      {yr.hours > 0 ? `${yr.hours}h` : "—"}
                    </td>
                    <td style={{ padding: "12px 0", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-muted)" }}>
                      {yr.jobs > 0 ? yr.jobs : "—"}
                    </td>
                    <td style={{ padding: "12px 0", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-muted)" }}>
                      {effectivePerHour > 0 ? `£${effectivePerHour.toFixed(2)}` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Per-tab breakdown */}
        <div className="card animate-fade" style={{ padding: 24, animationDelay: "300ms", animationFillMode: "both", opacity: 0 }}>
          <div className="label" style={{ marginBottom: 20 }}>All Periods · Detailed Breakdown</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {historical.map((tab) => (
              <div key={tab.tab} style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                borderRadius: 2,
                padding: "16px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div className="label">{tab.tab}</div>
                  <span className="tag tag-gold" style={{ fontSize: 9 }}>{tab.half}</span>
                </div>
                <div style={{ fontSize: 18, fontFamily: "var(--font-mono)", fontWeight: 500, marginBottom: 4 }}>
                  {tab.bankTotal > 0 ? `£${tab.bankTotal.toLocaleString("en-GB", { maximumFractionDigits: 0 })}` : "—"}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                  {tab.hours > 0 ? `${tab.hours}h · £${tab.perHour.toFixed(2)}/hr` : "—"}
                  {tab.jobs > 0 ? ` · ${tab.jobs} jobs` : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
