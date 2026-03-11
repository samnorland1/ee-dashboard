"use client";
import type { MonthlyData } from "@/lib/sheets";

export default function MonthlyTable({ data }: { data: MonthlyData[] }) {
  return (
    <div className="card animate-fade" style={{
      padding: "24px",
      animationDelay: "350ms",
      animationFillMode: "both",
      opacity: 0,
    }}>
      <div className="label" style={{ marginBottom: 16 }}>Monthly Breakdown</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["Month", "Earnings", "Hours", "Jobs", "£/hr", "Investment (20%)"].map((h) => (
              <th key={h} style={{
                textAlign: "left",
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-text-dim)",
                paddingBottom: 10,
                fontWeight: 400,
                fontFamily: "var(--font-mono)",
                borderBottom: "1px solid var(--color-border)",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const perHour = row.hours > 0 ? row.earnings / row.hours : 0;
            const isActive = row.earnings > 0;
            return (
              <tr
                key={row.month}
                style={{
                  opacity: isActive ? 1 : 0.3,
                  borderBottom: i < data.length - 1 ? "1px solid var(--color-border)" : "none",
                }}
              >
                <td style={{ padding: "10px 0", fontSize: 12, color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>
                  {row.month}
                </td>
                <td style={{ padding: "10px 0", fontSize: 12, color: "var(--color-text)", fontFamily: "var(--font-mono)" }}>
                  {isActive ? `£${row.earnings.toLocaleString("en-GB", { minimumFractionDigits: 2 })}` : "—"}
                </td>
                <td style={{ padding: "10px 0", fontSize: 12, color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                  {row.hours > 0 ? `${row.hours}h` : "—"}
                </td>
                <td style={{ padding: "10px 0", fontSize: 12, color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                  {row.jobs > 0 ? row.jobs : "—"}
                </td>
                <td style={{ padding: "10px 0", fontSize: 12, color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                  {perHour > 0 ? `£${perHour.toFixed(2)}` : "—"}
                </td>
                <td style={{ padding: "10px 0", fontSize: 12, color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                  {row.investment > 0 ? `£${row.investment.toLocaleString("en-GB", { minimumFractionDigits: 2 })}` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: "1px solid var(--color-border-bright)" }}>
            <td style={{ padding: "12px 0", fontSize: 11, color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
              Average
            </td>
            <td style={{ padding: "12px 0", fontSize: 12, color: "var(--color-accent)", fontFamily: "var(--font-mono)", fontWeight: 500 }}>
              £5,439.39
            </td>
            <td style={{ padding: "12px 0", fontSize: 12, color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
              146.7h
            </td>
            <td colSpan={3} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
