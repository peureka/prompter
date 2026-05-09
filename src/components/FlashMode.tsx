import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { firstLetters } from "../lib/text-cleaner";
import {
  FLASH_WPM_DEFAULT,
  FLASH_WPM_MIN,
  FLASH_WPM_MAX,
  FONT_SIZES,
  FONT_SIZE_DEFAULT,
  PAUSE_MARKER,
} from "../lib/constants";

export type FlashStyle = "word" | "letter" | "page";

interface FlashModeProps {
  text: string;
  onExit: () => void;
  onRate?: (rating: "slow" | "good" | "fast", wpm: number) => void;
  initialWpm?: number;
  initialFontSize?: number;
  onSettingsChange?: (wpm: number, fontSizeIndex: number) => void;
}

export function FlashMode({ text, onExit, onRate, initialWpm, initialFontSize, onSettingsChange }: FlashModeProps) {
  const [wpm, setWpm] = useState(initialWpm ?? FLASH_WPM_DEFAULT);
  const [fontSizeIndex, setFontSizeIndex] = useState(initialFontSize ?? FONT_SIZE_DEFAULT);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const [flashStyle, setFlashStyle] = useState<FlashStyle>("word");
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // Persist settings changes
  useEffect(() => {
    onSettingsChange?.(wpm, fontSizeIndex);
  }, [wpm, fontSizeIndex, onSettingsChange]);

  const words = useMemo(
    () => text.split(/\s+/).filter(Boolean),
    [text]
  );

  const initialsParagraphs = useMemo(
    () =>
      firstLetters(text)
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
    [text]
  );

  const isPageStyle = flashStyle === "page";

  const {
    currentWord,
    wordIndex,
    progress,
    isComplete,
    elapsedMs,
    actualWpm,
    totalWords,
    reset,
    skipWords,
  } = useFlashEngine({ words, wpm, isPlaying });

  const { controlsVisible } = useAutoHide(isPlaying);

  // Show stats when complete (only for engine-driven styles)
  if (!isPageStyle && isComplete && !showStats) {
    setIsPlaying(false);
    setShowStats(true);
  }

  const handleTogglePlay = useCallback(() => {
    if (isPageStyle) return;
    if (!hasStarted) {
      setShowCountdown(true);
      return;
    }
    setIsPlaying((p) => !p);
  }, [hasStarted, isPageStyle]);

  const handleCycleStyle = useCallback(() => {
    setFlashStyle((s) => {
      const next: FlashStyle = s === "word" ? "letter" : s === "letter" ? "page" : "word";
      if (next === "page") setIsPlaying(false);
      return next;
    });
  }, []);

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
      // Stay on stats screen — user chooses Again or Back
    },
    [onRate, actualWpm]
  );

  useKeyboard({
    onTogglePlay: handleTogglePlay,
    onSpeedUp: () => setWpm((w) => Math.min(w + 10, FLASH_WPM_MAX)),
    onSpeedDown: () => setWpm((w) => Math.max(w - 10, FLASH_WPM_MIN)),
    onSkipForward: () => !isPageStyle && skipWords(10),
    onSkipBack: () => !isPageStyle && skipWords(-10),
    onExit,
    onToggleMirror: () => setIsMirrored((m) => !m),
    onToggleFullscreen: toggleFullscreen,
    onToggleHelp: () => setShowHelp((h) => !h),
    onCycleStyle: handleCycleStyle,
  });

  useGestures(containerRef, {
    onTap: handleTogglePlay,
    onSwipeLeft: () => !isPageStyle && skipWords(10),
    onSwipeRight: () => !isPageStyle && skipWords(-10),
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

  const renderedWord = (() => {
    const source = hasStarted ? currentWord : words[0] || "";
    if (flashStyle === "letter") return source ? source[0] : "";
    return source;
  })();

  return (
    <Layout>
      {showCountdown && !isPageStyle && <Countdown onComplete={handleCountdownComplete} />}
      {showHelp && <KeyboardHelp onClose={() => setShowHelp(false)} />}

      <div
        ref={containerRef}
        className={`w-full h-full relative ${isPlaying && !isPageStyle ? "playing-mode" : ""} ${isPageStyle ? "" : "flex flex-col items-center justify-center"}`}
        style={{ cursor: isPageStyle ? "default" : "pointer" }}
      >
        {isPageStyle ? (
          <div
            className="w-full h-full overflow-y-auto px-8 md:px-12 py-12"
            style={{ transform: isMirrored ? "scaleX(-1)" : undefined }}
          >
            <div className="max-w-[800px] mx-auto">
              {initialsParagraphs.map((para, i) => {
                if (para === PAUSE_MARKER) {
                  return <div key={i} className="h-8" />;
                }
                return (
                  <p
                    key={i}
                    className="mb-6"
                    style={{
                      color: "#FFD700",
                      fontWeight: 700,
                      fontSize: `${FONT_SIZES[fontSizeIndex].size}rem`,
                      lineHeight: 1.7,
                      letterSpacing: "0.05em",
                      wordBreak: "break-word",
                    }}
                  >
                    {para}
                  </p>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {/* Focal point indicator */}
            <div className="absolute w-1 h-1 rounded-full bg-text/30" />

            {/* Current word or first letter */}
            <p
              style={{
                color: "#FFD700",
                fontWeight: 700,
                textAlign: "center",
                padding: "0 24px",
                fontSize: `clamp(1.5rem, ${FONT_SIZES[fontSizeIndex].size * 4}vw, ${FONT_SIZES[fontSizeIndex].size * 1.5}rem)`,
                opacity: hasStarted ? 1 : 0.3,
                transform: isMirrored ? "scaleX(-1)" : undefined,
                overflowWrap: "break-word",
                wordBreak: "break-word",
                maxWidth: "100%",
              }}
            >
              {renderedWord}
            </p>

            {/* Word counter */}
            <p className="absolute bottom-24 text-white/30 text-sm">
              {hasStarted ? `${wordIndex + 1} / ${totalWords}` : `${totalWords} words`}
            </p>
          </>
        )}
      </div>

      <Controls
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        wpm={wpm}
        onWpmChange={setWpm}
        wpmMin={FLASH_WPM_MIN}
        wpmMax={FLASH_WPM_MAX}
        fontSizeIndex={fontSizeIndex}
        onFontSizeChange={setFontSizeIndex}
        onReset={handleReset}
        visible={controlsVisible}
        isMirrored={isMirrored}
        onToggleMirror={() => setIsMirrored((m) => !m)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        flashStyle={flashStyle}
        onCycleStyle={handleCycleStyle}
      />

      {!isPageStyle && <ProgressBar progress={progress} />}
    </Layout>
  );
}
