import Sidebar from "@/components/Sidebar";

export default function TrendsPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "32px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            marginBottom: 6,
          }}>Trends</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
            Long-term performance analysis — connect more data to unlock
          </p>
        </div>
        <div className="card" style={{ padding: "60px 40px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 8 }}>
            Connect multiple years of Google Sheets data to unlock trend analysis
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-dim)" }}>
            Update SPREADSHEET_ID in .env.local and configure your sheet ranges in lib/sheets.ts
          </div>
        </div>
      </main>
    </div>
  );
}
