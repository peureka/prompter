import { useState } from "react";
import { formatDuration } from "../lib/wpm";
import { Layout } from "./Layout";

interface FlashStatsProps {
  actualWpm: number;
  totalWords: number;
  elapsedMs: number;
  onRate: (rating: "slow" | "good" | "fast") => void;
  onAgain: () => void;
  onBack: () => void;
}

const actionBtn = (primary: boolean) => ({
  padding: "14px 32px",
  borderRadius: 10,
  fontSize: "1rem",
  fontFamily: "inherit",
  cursor: "pointer" as const,
  fontWeight: 700,
  border: primary ? "none" : "1px solid rgba(255,215,0,0.3)",
  background: primary ? "#FFD700" : "transparent",
  color: primary ? "#000" : "#FFD700",
});

export function FlashStats({
  actualWpm,
  totalWords,
  elapsedMs,
  onRate,
  onAgain,
  onBack,
}: FlashStatsProps) {
  const [rated, setRated] = useState<"slow" | "good" | "fast" | null>(null);

  return (
    <Layout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          padding: 24,
        }}
      >
        <h2 style={{ color: "#FFD700", fontSize: "1.5rem", fontWeight: 700 }}>
          Session Complete
        </h2>

        <div style={{ display: "flex", gap: 40, textAlign: "center" }}>
          <div>
            <p style={{ fontSize: "1.875rem", fontWeight: 700, color: "#FFD700" }}>{actualWpm}</p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", marginTop: 4 }}>WPM</p>
          </div>
          <div>
            <p style={{ fontSize: "1.875rem", fontWeight: 700, color: "#FFD700" }}>{totalWords}</p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", marginTop: 4 }}>Words</p>
          </div>
          <div>
            <p style={{ fontSize: "1.875rem", fontWeight: 700, color: "#FFD700" }}>
              {formatDuration(elapsedMs / 1000)}
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", marginTop: 4 }}>Duration</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem" }}>How did that feel?</p>
          <div style={{ display: "flex", gap: 12 }}>
            {(["slow", "good", "fast"] as const).map((r) => {
              const isSelected = rated === r;
              const isDefault = r === "good" && !rated;
              const active = isSelected || isDefault;
              return (
                <button
                  key={r}
                  onClick={() => {
                    setRated(r);
                    onRate(r);
                  }}
                  style={{
                    padding: "12px 24px",
                    borderRadius: 10,
                    fontSize: "0.875rem",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    border: active ? "none" : "1px solid rgba(255,255,255,0.15)",
                    background: active ? "#FFD700" : "transparent",
                    color: active ? "#000" : "rgba(255,255,255,0.6)",
                    fontWeight: active ? 700 : 400,
                  }}
                >
                  {r === "slow" ? "Too slow" : r === "fast" ? "Too fast" : "Good"}
                </button>
              );
            })}
          </div>
          {rated && (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", marginTop: 4 }}>
              Saved!
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <button onClick={onAgain} style={actionBtn(true)}>Again</button>
          <button onClick={onBack} style={actionBtn(false)}>Back</button>
        </div>
      </div>
    </Layout>
  );
}
