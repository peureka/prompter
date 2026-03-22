import { useState, useCallback } from "react";
import { cleanText } from "../lib/text-cleaner";
import {
  wordCount,
  estimatedDurationSeconds,
  formatDuration,
} from "../lib/wpm";
import { SCROLL_WPM_DEFAULT } from "../lib/constants";
import { Layout } from "./Layout";

interface TextInputProps {
  onStart: (text: string, title: string, mode: "scroll" | "flash") => void;
  onBack: () => void;
}

export function TextInput({ onStart, onBack }: TextInputProps) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"scroll" | "flash">("scroll");

  const words = wordCount(text);
  const duration = estimatedDurationSeconds(text, SCROLL_WPM_DEFAULT);

  const handlePasteAndClean = useCallback(async () => {
    try {
      const clipboard = await navigator.clipboard.readText();
      const cleaned = cleanText(clipboard);
      setText(cleaned);
      if (!title) {
        setTitle(cleaned.split(/\s+/).slice(0, 5).join(" "));
      }
    } catch {
      // Clipboard API not available
    }
  }, [title]);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
    },
    []
  );

  const handleClean = useCallback(() => {
    setText(cleanText(text));
  }, [text]);

  const handleStart = useCallback(() => {
    if (!text.trim()) return;
    const finalTitle =
      title.trim() || text.trim().split(/\s+/).slice(0, 5).join(" ");
    onStart(text.trim(), finalTitle, mode);
  }, [text, title, mode, onStart]);

  return (
    <Layout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          paddingTop: 48,
          paddingBottom: 32,
          gap: 20,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontFamily: "inherit",
              padding: "4px 8px",
            }}
          >
            &larr; Back
          </button>
          <h1
            style={{
              color: "#FFD700",
              fontSize: "1.25rem",
              fontWeight: 700,
            }}
          >
            New Session
          </h1>
          <div style={{ width: 56 }} />
        </div>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="bg-transparent border border-white/15 rounded-lg text-text placeholder:text-white/20 outline-none focus:border-text/50 transition-colors text-sm"
          style={{ padding: "14px 16px" }}
        />

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setMode("scroll")}
            style={{
              flex: 1,
              padding: "14px 0",
              borderRadius: 10,
              fontSize: "0.875rem",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              background: mode === "scroll" ? "#FFD700" : "rgba(255,255,255,0.08)",
              color: mode === "scroll" ? "#000" : "rgba(255,255,255,0.4)",
            }}
          >
            Scroll
          </button>
          <button
            onClick={() => setMode("flash")}
            style={{
              flex: 1,
              padding: "14px 0",
              borderRadius: 10,
              fontSize: "0.875rem",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              background: mode === "flash" ? "#FFD700" : "rgba(255,255,255,0.08)",
              color: mode === "flash" ? "#000" : "rgba(255,255,255,0.4)",
            }}
          >
            Flash
          </button>
        </div>

        {/* Textarea */}
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Paste your text here..."
          className="bg-transparent border border-white/15 rounded-lg text-text placeholder:text-white/20 outline-none focus:border-text/50 transition-colors text-sm leading-relaxed"
          style={{
            flex: 1,
            padding: 16,
            resize: "none",
            fontFamily: "inherit",
          }}
        />

        {/* Stats + Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>
            {words} words &middot; ~{formatDuration(duration)} at{" "}
            {SCROLL_WPM_DEFAULT} WPM
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handlePasteAndClean}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)",
                border: "none",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontFamily: "inherit",
              }}
            >
              Paste & Clean
            </button>
            <button
              onClick={handleClean}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)",
                border: "none",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontFamily: "inherit",
              }}
            >
              Clean
            </button>
          </div>
        </div>

        {/* Start */}
        <button
          onClick={handleStart}
          disabled={!text.trim()}
          style={{
            padding: "18px 0",
            borderRadius: 10,
            background: text.trim() ? "#FFD700" : "rgba(255,215,0,0.3)",
            color: "#000",
            fontWeight: 700,
            fontSize: "1.125rem",
            border: "none",
            cursor: text.trim() ? "pointer" : "not-allowed",
            fontFamily: "inherit",
          }}
        >
          Start
        </button>
      </div>
    </Layout>
  );
}
