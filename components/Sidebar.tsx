"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, BarChart2, Users, TrendingUp, LogOut } from "lucide-react";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/reports", label: "Reports", icon: BarChart2 },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/trends", label: "Trends", icon: TrendingUp },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isLight, setIsLight] = useState(false);

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/login";
  }

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains("light-mode"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <aside style={{
      width: 200,
      minHeight: "100vh",
      background: "var(--color-surface)",
      borderRight: "1px solid var(--color-border)",
      display: "flex",
      flexDirection: "column",
      padding: "24px 0",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "0 20px 32px" }}>
        <Image
          src={isLight ? "/logo-light.png" : "/logo.png"}
          alt="Email Evolution"
          width={140}
          height={48}
          style={{ objectFit: "contain", objectPosition: "left" }}
        />
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 8px" }}>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`nav-link ${active ? "active" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 11,
              }}
            >
              <Icon size={13} strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ marginTop: "auto", padding: "0 20px" }}>
        <hr className="divider" style={{ marginBottom: 16 }} />
        <div className="label" style={{ marginBottom: 6 }}>Data source</div>
        <div style={{
          fontSize: 11,
          color: "var(--color-text-muted)",
          lineHeight: 1.4,
        }}>
          Google Sheets
        </div>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          marginTop: 8,
        }}>
          <div style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#4ade80",
            animation: "pulse 2s infinite",
          }} />
          <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>Live</span>
        </div>

        <button
          onClick={logout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginTop: 16,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: 11,
            color: "var(--color-text-dim)",
            fontFamily: "var(--font-mono), monospace",
            letterSpacing: "0.06em",
            padding: 0,
          }}
        >
          <LogOut size={12} strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
