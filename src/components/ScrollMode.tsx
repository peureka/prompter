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
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const fontSize = FONT_SIZES[fontSizeIndex].size;

  const paragraphs = useMemo(
    () =>
      text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
    [text]
  );

  const { progress, isComplete, reset } = useScrollEngine({
    text,
    wpm,
    isPlaying,
    containerRef: scrollRef,
  });

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

  return (
    <Layout>
      {showCountdown && <Countdown onComplete={handleCountdownComplete} />}
      {showHelp && <KeyboardHelp onClose={() => setShowHelp(false)} />}

      <div
        ref={containerRef}
        className={`w-full h-full relative ${isPlaying ? "playing-mode" : ""}`}
        style={{ cursor: "pointer" }}
      >
        {/* Gradient masks for top and bottom fade */}
        <div
          className="absolute top-0 left-0 w-full z-10 pointer-events-none"
          style={{
            height: "20%",
            background: "linear-gradient(to bottom, #000 0%, transparent 100%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-full z-10 pointer-events-none"
          style={{
            height: "30%",
            background: "linear-gradient(to top, #000 0%, transparent 100%)",
          }}
        />

        {/* Scrollable text container */}
        <div
          ref={scrollRef}
          className="w-full h-full overflow-hidden px-8 md:px-12"
          style={{
            scrollBehavior: "auto",
            overflowY: "hidden",
          }}
        >
          {/* Top spacer — pushes first text to vertical center */}
          <div style={{ height: "40vh" }} />

          <div
            style={{
              transform: isMirrored ? "scaleX(-1)" : undefined,
            }}
          >
            {paragraphs.map((para, i) => {
              const isPause = para.trim() === PAUSE_MARKER;
              if (isPause) {
                return <div key={i} className="h-8" />;
              }
              return (
                <p
                  key={i}
                  className="mb-8 leading-relaxed"
                  style={{
                    fontSize: `${fontSize}rem`,
                    lineHeight: 1.7,
                    wordBreak: "break-word",
                  }}
                >
                  {para}
                </p>
              );
            })}
          </div>

          {/* Bottom spacer — allows last text to scroll to center */}
          <div style={{ height: "60vh" }} />
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
                  className={`px-5 py-2.5 rounded-lg text-sm transition-colors ${
                    rating === "good"
                      ? "bg-text text-bg font-bold hover:opacity-90"
                      : "border border-white/15 text-white/60 hover:text-text hover:border-text/30"
                  }`}
                >
                  {rating === "slow"
                    ? "Too slow"
                    : rating === "fast"
                      ? "Too fast"
                      : "Good"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mt-2">
            <button
              onClick={handleReset}
              className="px-8 py-3 rounded-lg bg-text text-bg font-bold hover:opacity-90 transition-opacity"
            >
              Again
            </button>
            <button
              onClick={onExit}
              className="px-8 py-3 rounded-lg border border-text/30 text-text hover:bg-text/10 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
