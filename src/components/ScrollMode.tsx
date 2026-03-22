import { useCallback, useMemo, useRef, useState } from "react";
import { useScrollEngine } from "../lib/hooks/use-scroll-engine";
import { useAutoHide } from "../lib/hooks/use-auto-hide";
import { useKeyboard } from "../lib/hooks/use-keyboard";
import { useGestures } from "../lib/hooks/use-gestures";
import { useFullscreen } from "../lib/hooks/use-fullscreen";
import { Layout } from "./Layout";
import { Countdown } from "./Countdown";
import { Controls } from "./Controls";
import { ProgressBar } from "./ProgressBar";
import { KeyboardHelp } from "./KeyboardHelp";
import {
  SCROLL_WPM_DEFAULT,
  SCROLL_WPM_MIN,
  SCROLL_WPM_MAX,
  FONT_SIZES,
  FONT_SIZE_DEFAULT,
  PAUSE_MARKER,
} from "../lib/constants";

interface ScrollModeProps {
  text: string;
  onExit: () => void;
  onComplete?: (wpm: number, comfort: "slow" | "good" | "fast") => void;
}

export function ScrollMode({ text, onExit, onComplete }: ScrollModeProps) {
  const [wpm, setWpm] = useState(SCROLL_WPM_DEFAULT);
  const [fontSizeIndex, setFontSizeIndex] = useState(FONT_SIZE_DEFAULT);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const fontSize = FONT_SIZES[fontSizeIndex].size;
  const lineHeightPx = fontSize * 16 * 1.8;
  const wordsPerLine = 8;

  const lines = useMemo(
    () => text.split("\n").filter((l) => l.trim().length > 0),
    [text]
  );

  const { scrollY, currentLineIndex, progress, isComplete, reset } =
    useScrollEngine({
      lines,
      wpm,
      isPlaying,
      lineHeightPx,
      wordsPerLine,
    }) as ReturnType<typeof useScrollEngine> & { reset: () => void };

  const { controlsVisible } = useAutoHide(isPlaying);

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
    reset();
  }, [reset]);

  useKeyboard({
    onTogglePlay: handleTogglePlay,
    onSpeedUp: () => setWpm((w) => Math.min(w + 10, SCROLL_WPM_MAX)),
    onSpeedDown: () => setWpm((w) => Math.max(w - 10, SCROLL_WPM_MIN)),
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

  const visibleAbove = 3;
  const visibleBelow = 8;

  return (
    <Layout>
      {showCountdown && <Countdown onComplete={handleCountdownComplete} />}
      {showHelp && <KeyboardHelp onClose={() => setShowHelp(false)} />}

      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden relative px-6"
        style={{ cursor: "pointer" }}
      >
        <div
          className="absolute w-full left-0 px-6 transition-transform"
          style={{
            transform: `translateY(${-scrollY + lineHeightPx * 4}px)${isMirrored ? " scaleX(-1)" : ""}`,
          }}
        >
          {lines.map((line, i) => {
            const distance = Math.abs(i - currentLineIndex);
            const isAbove = i < currentLineIndex;
            const isBelow = i > currentLineIndex;
            const isCurrent = i === currentLineIndex;
            const isPause = line.trim() === PAUSE_MARKER;

            let opacity = 0;
            if (isCurrent) opacity = 1;
            else if (isAbove && distance <= visibleAbove)
              opacity = 0.3 - (distance - 1) * 0.08;
            else if (isBelow && distance <= visibleBelow)
              opacity = 0.6 - (distance - 1) * 0.06;

            if (!hasStarted) {
              if (i <= visibleBelow) opacity = i === 0 ? 1 : 0.6 - i * 0.06;
            }

            if (isPause) return (
              <div key={i} style={{ height: lineHeightPx, opacity: 0 }} />
            );

            return (
              <div
                key={i}
                className="transition-opacity duration-150"
                style={{
                  fontSize: `${fontSize}rem`,
                  lineHeight: `${lineHeightPx}px`,
                  height: lineHeightPx,
                  opacity,
                  fontWeight: isCurrent ? 700 : 400,
                }}
              >
                {line}
              </div>
            );
          })}
        </div>
      </div>

      <Controls
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        wpm={wpm}
        onWpmChange={setWpm}
        wpmMin={SCROLL_WPM_MIN}
        wpmMax={SCROLL_WPM_MAX}
        fontSizeIndex={fontSizeIndex}
        onFontSizeChange={setFontSizeIndex}
        onReset={handleReset}
        visible={controlsVisible}
        isMirrored={isMirrored}
        onToggleMirror={() => setIsMirrored((m) => !m)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      <ProgressBar progress={progress} />

      {isComplete && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg/90 gap-8">
          <p className="text-text text-2xl font-bold">Done</p>
          <p className="text-white/40 text-sm">at {wpm} WPM</p>

          <div className="flex flex-col items-center gap-3">
            <p className="text-white/60 text-sm">How did that feel?</p>
            <div className="flex gap-3">
              {(["slow", "good", "fast"] as const).map((rating) => (
                <button
                  key={rating}
                  onClick={() => onComplete?.(wpm, rating)}
                  className={`px-5 py-2 rounded-lg text-sm transition-colors ${
                    rating === "good"
                      ? "bg-text text-bg font-bold hover:opacity-90"
                      : "border border-white/15 text-white/60 hover:text-text hover:border-text/30"
                  }`}
                >
                  {rating === "slow" ? "Too slow" : rating === "fast" ? "Too fast" : "Good"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-lg bg-text text-bg font-bold hover:opacity-90 transition-opacity"
            >
              Again
            </button>
            <button
              onClick={onExit}
              className="px-6 py-3 rounded-lg border border-text/30 text-text hover:bg-text/10 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
