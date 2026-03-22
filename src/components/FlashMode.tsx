import { useCallback, useMemo, useRef, useState } from "react";
import { useFlashEngine } from "../lib/hooks/use-flash-engine";
import { useAutoHide } from "../lib/hooks/use-auto-hide";
import { useKeyboard } from "../lib/hooks/use-keyboard";
import { useGestures } from "../lib/hooks/use-gestures";
import { Layout } from "./Layout";
import { Countdown } from "./Countdown";
import { ProgressBar } from "./ProgressBar";
import { FlashStats } from "./FlashStats";
import { KeyboardHelp } from "./KeyboardHelp";
import {
  FLASH_WPM_DEFAULT,
  FLASH_WPM_MIN,
  FLASH_WPM_MAX,
} from "../lib/constants";

interface FlashModeProps {
  text: string;
  onExit: () => void;
  onRate?: (rating: "slow" | "good" | "fast", wpm: number) => void;
}

export function FlashMode({ text, onExit, onRate }: FlashModeProps) {
  const [wpm, setWpm] = useState(FLASH_WPM_DEFAULT);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const words = useMemo(
    () => text.split(/\s+/).filter(Boolean),
    [text]
  );

  const {
    currentWord,
    wordIndex,
    progress,
    isComplete,
    elapsedMs,
    actualWpm,
    totalWords,
    reset,
  } = useFlashEngine({ words, wpm, isPlaying });

  const { controlsVisible } = useAutoHide(isPlaying);

  // Show stats when complete
  if (isComplete && !showStats) {
    setIsPlaying(false);
    setShowStats(true);
  }

  const handleTogglePlay = useCallback(() => {
    if (!hasStarted) {
      setShowCountdown(true);
      return;
    }
    setIsPlaying((p) => !p);
  }, [hasStarted]);

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    setHasStarted(true);
    setIsPlaying(true);
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setHasStarted(false);
    setShowStats(false);
    reset();
  }, [reset]);

  const handleRate = useCallback(
    (rating: "slow" | "good" | "fast") => {
      onRate?.(rating, actualWpm);
      onExit();
    },
    [onRate, actualWpm, onExit]
  );

  useKeyboard({
    onTogglePlay: handleTogglePlay,
    onSpeedUp: () => setWpm((w) => Math.min(w + 10, FLASH_WPM_MAX)),
    onSpeedDown: () => setWpm((w) => Math.max(w - 10, FLASH_WPM_MIN)),
    onSkipForward: () => {},
    onSkipBack: () => {},
    onExit,
    onToggleHelp: () => setShowHelp((h) => !h),
  });

  useGestures(containerRef, {
    onTap: handleTogglePlay,
    onSwipeLeft: () => {},
    onSwipeRight: () => {},
  });

  if (showStats) {
    return (
      <FlashStats
        actualWpm={actualWpm}
        totalWords={totalWords}
        elapsedMs={elapsedMs}
        onRate={handleRate}
        onAgain={handleReset}
        onBack={onExit}
      />
    );
  }

  return (
    <Layout>
      {showCountdown && <Countdown onComplete={handleCountdownComplete} />}
      {showHelp && <KeyboardHelp onClose={() => setShowHelp(false)} />}

      <div
        ref={containerRef}
        className="w-full h-full flex flex-col items-center justify-center relative"
        style={{ cursor: "pointer" }}
      >
        {/* Focal point indicator */}
        <div className="absolute w-1 h-1 rounded-full bg-text/30" />

        {/* Current word */}
        <p
          className="text-text font-bold transition-opacity duration-75 px-4 text-center"
          style={{
            fontSize: `clamp(2rem, 10vw, 6rem)`,
            opacity: hasStarted ? 1 : 0.3,
          }}
        >
          {hasStarted ? currentWord : words[0] || ""}
        </p>

        {/* Word counter */}
        <p className="absolute bottom-24 text-white/30 text-sm">
          {hasStarted ? `${wordIndex + 1} / ${totalWords}` : `${totalWords} words`}
        </p>
      </div>

      {/* Speed control */}
      <div
        className="fixed bottom-[2px] left-0 w-full z-30 transition-opacity duration-300 px-4 pb-4"
        style={{
          opacity: controlsVisible ? 1 : 0,
          pointerEvents: controlsVisible ? "auto" : "none",
        }}
      >
        <div
          className="max-w-[800px] mx-auto flex items-center gap-4 rounded-lg px-4 py-3"
          style={{
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(12px)",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePlay();
            }}
            className="text-white hover:text-text transition-colors shrink-0"
          >
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6,4 20,12 6,20" />
              </svg>
            )}
          </button>

          <input
            type="range"
            min={FLASH_WPM_MIN}
            max={FLASH_WPM_MAX}
            value={wpm}
            onChange={(e) => {
              e.stopPropagation();
              setWpm(Number(e.target.value));
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 accent-text"
          />
          <span className="text-white text-xs whitespace-nowrap w-16 text-right">
            {wpm} WPM
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            className="text-white/50 hover:text-white transition-colors shrink-0"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>
        </div>
      </div>

      <ProgressBar progress={progress} />
    </Layout>
  );
}
