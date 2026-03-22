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

export function FlashStats({
  actualWpm,
  totalWords,
  elapsedMs,
  onRate,
  onAgain,
  onBack,
}: FlashStatsProps) {
  return (
    <Layout>
      <div className="flex flex-col h-full items-center justify-center gap-8 p-6">
        <h2 className="text-text text-2xl font-bold">Session Complete</h2>

        <div className="flex gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-text">{actualWpm}</p>
            <p className="text-white/40 text-xs mt-1">WPM</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-text">{totalWords}</p>
            <p className="text-white/40 text-xs mt-1">Words</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-text">
              {formatDuration(elapsedMs / 1000)}
            </p>
            <p className="text-white/40 text-xs mt-1">Duration</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="text-white/60 text-sm">How did that feel?</p>
          <div className="flex gap-3">
            <button
              onClick={() => onRate("slow")}
              className="px-5 py-2 rounded-lg border border-white/15 text-white/60 hover:text-text hover:border-text/30 transition-colors text-sm"
            >
              Too slow
            </button>
            <button
              onClick={() => onRate("good")}
              className="px-5 py-2 rounded-lg bg-text text-bg font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Good
            </button>
            <button
              onClick={() => onRate("fast")}
              className="px-5 py-2 rounded-lg border border-white/15 text-white/60 hover:text-text hover:border-text/30 transition-colors text-sm"
            >
              Too fast
            </button>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={onAgain}
            className="px-6 py-3 rounded-lg bg-text text-bg font-bold hover:opacity-90 transition-opacity"
          >
            Again
          </button>
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-lg border border-text/30 text-text hover:bg-text/10 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </Layout>
  );
}
