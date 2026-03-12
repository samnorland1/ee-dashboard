import { getCachedDashboardData } from "@/lib/sheets";
import Sidebar from "@/components/Sidebar";
import ZoomControl from "@/components/ZoomControl";
import ThemeToggle from "@/components/ThemeToggle";
import OverviewClient from "@/components/OverviewClient";
import MobileLogo from "@/components/MobileLogo";

export default async function DashboardPage() {
  const data = await getCachedDashboardData();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main id="dashboard-main" style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
        {/* Mobile logo — hidden on desktop */}
        <MobileLogo />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }} className="animate-fade page-header">
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--color-text)", letterSpacing: "-0.02em" }}>
                Overview
              </h1>
            </div>
            <p style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
              Email Evolution · Updated live from Google Sheets
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <ThemeToggle />
            <ZoomControl />
          </div>
        </div>

        <OverviewClient data={data} />
      </main>
    </div>
  );
}
