"use client";
import { useEffect, useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

const LEVELS = [0.7, 0.8, 0.9, 1.0, 1.1, 1.25, 1.5];
const DEFAULT = 1.0;
const KEY = "dashboard-zoom";

export default function ZoomControl() {
  const [zoom, setZoom] = useState(DEFAULT);

  useEffect(() => {
    const saved = parseFloat(localStorage.getItem(KEY) || "1");
    if (LEVELS.includes(saved)) {
      setZoom(saved);
      applyZoom(saved);
    }
  }, []);

  function applyZoom(z: number) {
    const el = document.getElementById("dashboard-main");
    if (el) (el.style as any).zoom = String(z);
  }

  function change(delta: number) {
    const idx = LEVELS.indexOf(zoom);
    const next = LEVELS[Math.max(0, Math.min(LEVELS.length - 1, idx + delta))];
    setZoom(next);
    applyZoom(next);
    localStorage.setItem(KEY, String(next));
  }

  function reset() {
    setZoom(DEFAULT);
    applyZoom(DEFAULT);
    localStorage.setItem(KEY, String(DEFAULT));
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 4,
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: 2,
      padding: "4px 8px",
    }}>
      <button
        className="btn"
        onClick={() => change(-1)}
        disabled={zoom === LEVELS[0]}
        style={{ padding: "4px 6px", border: "none", background: "transparent", opacity: zoom === LEVELS[0] ? 0.3 : 1 }}
        title="Zoom out"
      >
        <ZoomOut size={13} />
      </button>
      <button
        onClick={reset}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: zoom === DEFAULT ? "var(--color-text-muted)" : "var(--color-accent)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "0 4px",
          minWidth: 36,
          textAlign: "center",
        }}
        title="Reset zoom"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        className="btn"
        onClick={() => change(1)}
        disabled={zoom === LEVELS[LEVELS.length - 1]}
        style={{ padding: "4px 6px", border: "none", background: "transparent", opacity: zoom === LEVELS[LEVELS.length - 1] ? 0.3 : 1 }}
        title="Zoom in"
      >
        <ZoomIn size={13} />
      </button>
    </div>
  );
}
