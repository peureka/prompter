import { useCallback, useMemo, useRef, useState } from "react";
import { useFlashEngine } from "../lib/hooks/use-flash-engine";
import { useAutoHide } from "../lib/hooks/use-auto-hide";
import { useKeyboard } from "../lib/hooks/use-keyboard";
import { useGestures } from "../lib/hooks/use-gestures";
import { useFullscreen } from "../lib/hooks/use-fullscreen";
import { Layout } from "./Layout";
import { Countdown } from "./Countdown";
import { Controls } from "./Controls";
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
  const [isMirrored, setIsMirrored] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

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
    onToggleMirror: () => setIsMirrored((m) => !m),
    onToggleFullscreen: toggleFullscreen,
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
        className={`w-full h-full flex flex-col items-center justify-center relative ${isPlaying ? "playing-mode" : ""}`}
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
            transform: isMirrored ? "scaleX(-1)" : undefined,
          }}
        >
          {hasStarted ? currentWord : words[0] || ""}
        </p>

        {/* Word counter */}
        <p className="absolute bottom-24 text-white/30 text-sm">
          {hasStarted ? `${wordIndex + 1} / ${totalWords}` : `${totalWords} words`}
        </p>
      </div>

      <Controls
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        wpm={wpm}
        onWpmChange={setWpm}
        wpmMin={FLASH_WPM_MIN}
        wpmMax={FLASH_WPM_MAX}
        fontSizeIndex={0}
        onFontSizeChange={() => {}}
        onReset={handleReset}
        visible={controlsVisible}
        isMirrored={isMirrored}
        onToggleMirror={() => setIsMirrored((m) => !m)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      <ProgressBar progress={progress} />
    </Layout>
  );
}
