"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Incorrect password");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 360,
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <Image src="/logo.png" alt="Email Evolution" width={160} height={52} style={{ objectFit: "contain" }} />
        </div>

        {/* Card */}
        <div className="card" style={{ padding: "32px 28px" }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontWeight: 600,
              color: "var(--color-text)",
              marginBottom: 6,
            }}>
              Dashboard Login
            </h1>
            <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              Enter your password to access the dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="label" style={{ display: "block", marginBottom: 6 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••"
                autoFocus
                required
                style={{
                  width: "100%",
                  background: "var(--color-surface-2)",
                  border: `1px solid ${error ? "var(--color-red)" : "var(--color-border)"}`,
                  borderRadius: 2,
                  padding: "9px 12px",
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 13,
                  color: "var(--color-text)",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => { e.target.style.borderColor = "var(--color-accent)"; setError(""); }}
                onBlur={e => { e.target.style.borderColor = error ? "var(--color-red)" : "var(--color-border)"; }}
              />
              {error && (
                <p style={{ fontSize: 11, color: "var(--color-red)", marginTop: 5 }}>{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px 0",
                background: "var(--color-accent)",
                color: "#fff",
                border: "none",
                borderRadius: 2,
                fontFamily: "var(--font-mono), monospace",
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "var(--color-text-dim)" }}>
          Email Evolution · Private Dashboard
        </p>
      </div>
    </div>
  );
}
