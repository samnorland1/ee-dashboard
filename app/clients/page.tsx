import Sidebar from "@/components/Sidebar";
import { getMockData } from "@/lib/sheets";
import ClientBreakdown from "@/components/ClientBreakdown";

export default async function ClientsPage() {
  const data = await getMockData();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px" }}>
        <div style={{ marginBottom: 32 }} className="animate-fade">
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}>Clients</h1>
          </div>
          <p style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
            B2C · B2B · New · Returning · Email performance
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <ClientBreakdown data={data} />

          <div className="card animate-fade" style={{ padding: 24, animationDelay: "100ms", animationFillMode: "both", opacity: 0 }}>
            <div className="label" style={{ marginBottom: 20 }}>Client Stats</div>
            {[
              { label: "B2C Clients", value: `${data.clients.b2c}` },
              { label: "B2B Clients", value: `${data.clients.b2b}` },
              { label: "Returning Clients", value: `${data.clients.returning}` },
              { label: "New Clients (Q3/Q4)", value: `${data.clients.newClientsQ3Q4}` },
              { label: "Total Emails Sent", value: `${data.clients.totalEmails}` },
              { label: "Revenue per Email", value: `£${data.clients.perEmail.toFixed(2)}` },
            ].map((row) => (
              <div key={row.label} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid var(--color-border)",
              }}>
                <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{row.label}</span>
                <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--color-text)" }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
