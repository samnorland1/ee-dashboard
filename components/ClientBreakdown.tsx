"use client";
import type { DashboardData } from "@/lib/sheets";

export default function ClientBreakdown({ data }: { data: DashboardData }) {
  const { clients } = data;
  const total = clients.b2c + clients.b2b;
  const b2cPct = Math.round((clients.b2c / total) * 100);
  const b2bPct = 100 - b2cPct;
  const returnPct = Math.round((clients.returning / (clients.returning + clients.newClientsQ3Q4)) * 100);

  return (
    <div className="card animate-fade" style={{
      padding: "24px",
      animationDelay: "500ms",
      animationFillMode: "both",
      opacity: 0,
    }}>
      <div className="label" style={{ marginBottom: 20 }}>Client Breakdown</div>

      {/* B2C vs B2B */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>B2C · {b2cPct}%</span>
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>B2B · {b2bPct}%</span>
        </div>
        <div style={{
          display: "flex",
          height: 4,
          borderRadius: 2,
          overflow: "hidden",
          gap: 1,
        }}>
          <div style={{
            flex: b2cPct,
            background: "var(--color-accent)",
            borderRadius: "2px 0 0 2px",
          }} />
          <div style={{
            flex: b2bPct,
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border-bright)",
            borderRadius: "0 2px 2px 0",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 11, color: "var(--color-text)" }}>{clients.b2c} clients</span>
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{clients.b2b} client</span>
        </div>
      </div>

      <hr className="divider" style={{ marginBottom: 16 }} />

      {/* Return vs New */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>Returning · {returnPct}%</span>
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>New</span>
        </div>
        <div style={{
          display: "flex",
          height: 4,
          borderRadius: 2,
          overflow: "hidden",
          gap: 1,
        }}>
          <div style={{
            flex: returnPct,
            background: "#60a5fa",
            borderRadius: "2px 0 0 2px",
          }} />
          <div style={{
            flex: 100 - returnPct,
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border-bright)",
            borderRadius: "0 2px 2px 0",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 11, color: "var(--color-text)" }}>{clients.returning} clients</span>
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{clients.newClientsQ3Q4} new</span>
        </div>
      </div>

      <hr className="divider" style={{ marginBottom: 16 }} />

      {/* Email metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div className="label" style={{ marginBottom: 4 }}>Total Emails</div>
          <div style={{ fontSize: 18, fontFamily: "var(--font-mono)", fontWeight: 500 }}>
            {clients.totalEmails}
          </div>
        </div>
        <div>
          <div className="label" style={{ marginBottom: 4 }}>£ per Email</div>
          <div style={{ fontSize: 18, fontFamily: "var(--font-mono)", fontWeight: 500 }}>
            £{clients.perEmail.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
