import { useState, useCallback } from "react";
import { cleanText } from "../lib/text-cleaner";
import { wordCount, estimatedDurationSeconds, formatDuration } from "../lib/wpm";
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
      // Clipboard API not available, user can paste manually
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
      <div className="flex flex-col h-full p-6 gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-white/50 hover:text-white transition-colors text-sm"
          >
            &larr; Back
          </button>
          <h1 className="text-text text-lg font-bold">New Session</h1>
          <div className="w-12" />
        </div>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="bg-transparent border border-white/15 rounded-lg px-4 py-2 text-text placeholder:text-white/20 outline-none focus:border-text/50 transition-colors"
        />

        {/* Mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode("scroll")}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
              mode === "scroll"
                ? "bg-text text-bg"
                : "bg-white/8 text-white/50 hover:text-white"
            }`}
          >
            Scroll
          </button>
          <button
            onClick={() => setMode("flash")}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
              mode === "flash"
                ? "bg-text text-bg"
                : "bg-white/8 text-white/50 hover:text-white"
            }`}
          >
            Flash
          </button>
        </div>

        {/* Textarea */}
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Paste your text here..."
          className="flex-1 bg-transparent border border-white/15 rounded-lg p-4 text-text placeholder:text-white/20 outline-none focus:border-text/50 transition-colors resize-none text-sm leading-relaxed"
        />

        {/* Stats + Actions */}
        <div className="flex items-center justify-between text-xs text-white/40">
          <span>
            {words} words &middot; ~{formatDuration(duration)} at{" "}
            {SCROLL_WPM_DEFAULT} WPM
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePasteAndClean}
              className="px-3 py-1 rounded bg-white/8 text-white/60 hover:text-white transition-colors"
            >
              Paste & Clean
            </button>
            <button
              onClick={handleClean}
              className="px-3 py-1 rounded bg-white/8 text-white/60 hover:text-white transition-colors"
            >
              Clean
            </button>
          </div>
        </div>

        {/* Start */}
        <button
          onClick={handleStart}
          disabled={!text.trim()}
          className="py-4 rounded-lg bg-text text-bg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Start
        </button>
      </div>
    </Layout>
  );
}
