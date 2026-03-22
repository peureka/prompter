import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

// Focal point at 38% of viewport height
const FOCAL_RATIO = 0.38;

// Opacity curve: how quickly text fades based on distance from focal point
// Distance in pixels → opacity
function getEmphasis(distancePx: number): { opacity: number; scale: number } {
  const absDist = Math.abs(distancePx);
  // Within 40px of focal: full brightness
  if (absDist < 40) return { opacity: 1, scale: 1.04 };
  // 40-120px: bright
  if (absDist < 120) {
    const t = (absDist - 40) / 80;
    return { opacity: 1 - t * 0.35, scale: 1.04 - t * 0.04 };
  }
  // 120-250px: medium
  if (absDist < 250) {
    const t = (absDist - 120) / 130;
    return { opacity: 0.65 - t * 0.35, scale: 1 };
  }
  // 250-400px: dim
  if (absDist < 400) {
    const t = (absDist - 250) / 150;
    return { opacity: 0.3 - t * 0.18, scale: 1 };
  }
  // Beyond: very dim
  return { opacity: 0.1, scale: 1 };
}

interface ScrollModeProps {
  text: string;
  onExit: () => void;
  onComplete?: (wpm: number, comfort: "slow" | "good" | "fast") => void;
  initialWpm?: number;
  initialFontSize?: number;
  onSettingsChange?: (wpm: number, fontSizeIndex: number) => void;
}

export function ScrollMode({
  text,
  onExit,
  onComplete,
  initialWpm,
  initialFontSize,
  onSettingsChange,
}: ScrollModeProps) {
  const [wpm, setWpm] = useState(initialWpm ?? SCROLL_WPM_DEFAULT);
  const [fontSizeIndex, setFontSizeIndex] = useState(
    initialFontSize ?? FONT_SIZE_DEFAULT
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pauseRefs = useRef<(HTMLElement | null)[]>([]);
  const paraRefs = useRef<(HTMLElement | null)[]>([]);
  const emphasisRafRef = useRef<number>(0);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  useEffect(() => {
    onSettingsChange?.(wpm, fontSizeIndex);
  }, [wpm, fontSizeIndex, onSettingsChange]);

  const fontSize = FONT_SIZES[fontSizeIndex].size;

  const paragraphs = useMemo(
    () =>
      text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
    [text]
  );

  const { progress, isComplete, reset, skip } = useScrollEngine({
    text,
    wpm,
    isPlaying,
    containerRef: scrollRef,
    pauseElements: pauseRefs,
  });

  // Dynamic emphasis: update paragraph opacity/scale on every frame during playback
  const updateEmphasis = useCallback(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    const focalY =
      scrollEl.getBoundingClientRect().top + scrollEl.clientHeight * FOCAL_RATIO;

    for (let i = 0; i < paraRefs.current.length; i++) {
      const el = paraRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const paraCenter = rect.top + rect.height / 2;
      const distance = paraCenter - focalY;
      const { opacity, scale } = getEmphasis(distance);
      el.style.opacity = String(opacity);
      el.style.transform = scale !== 1 ? `scale(${scale})` : "";
    }

    emphasisRafRef.current = requestAnimationFrame(updateEmphasis);
  }, []);

  useEffect(() => {
    if (hasStarted) {
      emphasisRafRef.current = requestAnimationFrame(updateEmphasis);
    }
    return () => cancelAnimationFrame(emphasisRafRef.current);
  }, [hasStarted, updateEmphasis]);

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
    // Reset all emphasis
    for (const el of paraRefs.current) {
      if (el) {
        el.style.opacity = "1";
        el.style.transform = "";
      }
    }
  }, [reset]);

  useKeyboard({
    onTogglePlay: handleTogglePlay,
    onSpeedUp: () => setWpm((w) => Math.min(w + 10, SCROLL_WPM_MAX)),
    onSpeedDown: () => setWpm((w) => Math.max(w - 10, SCROLL_WPM_MIN)),
    onSkipForward: () => skip(5),
    onSkipBack: () => skip(-5),
    onExit,
    onToggleMirror: () => setIsMirrored((m) => !m),
    onToggleFullscreen: toggleFullscreen,
    onToggleHelp: () => setShowHelp((h) => !h),
  });

  useGestures(containerRef, {
    onTap: handleTogglePlay,
    onSwipeLeft: () => skip(5),
    onSwipeRight: () => skip(-5),
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
        {/* Top/bottom edge fades — tighter than before */}
        <div
          className="absolute top-0 left-0 w-full z-10 pointer-events-none"
          style={{
            height: "25%",
            background:
              "linear-gradient(to bottom, #000 0%, transparent 100%)",
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
          style={{ overflowY: "hidden" }}
        >
          {/* Top spacer — pushes first text to focal point */}
          <div style={{ height: `${FOCAL_RATIO * 100}vh` }} />

          <div
            style={{
              transform: isMirrored ? "scaleX(-1)" : undefined,
            }}
          >
            {paragraphs.map((para, i) => {
              const isPause = para.trim() === PAUSE_MARKER;
              if (isPause) {
                return (
                  <div
                    key={i}
                    className="h-8"
                    ref={(el) => {
                      pauseRefs.current[i] = el;
                    }}
                  />
                );
              }
              return (
                <p
                  key={i}
                  ref={(el) => {
                    paraRefs.current[i] = el;
                  }}
                  className="mb-8"
                  style={{
                    fontSize: `${fontSize}rem`,
                    lineHeight: 1.7,
                    wordBreak: "break-word",
                    transformOrigin: "left center",
                    willChange: "opacity, transform",
                    transition: "none",
                  }}
                >
                  {para}
                </p>
              );
            })}
          </div>

          {/* Bottom spacer */}
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
