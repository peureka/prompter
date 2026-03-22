import { useCallback, useEffect, useRef, useState } from "react";
import { PAUSE_MARKER, PAUSE_DURATION_MS } from "../constants";

interface ScrollState {
  scrollY: number;
  currentLineIndex: number;
  progress: number;
  elapsedMs: number;
  isComplete: boolean;
}

interface UseScrollEngineOptions {
  lines: string[];
  wpm: number;
  isPlaying: boolean;
  lineHeightPx: number;
  wordsPerLine: number;
}

export function useScrollEngine({
  lines,
  wpm,
  isPlaying,
  lineHeightPx,
  wordsPerLine,
}: UseScrollEngineOptions): ScrollState {
  const [state, setState] = useState<ScrollState>({
    scrollY: 0,
    currentLineIndex: 0,
    progress: 0,
    elapsedMs: 0,
    isComplete: false,
  });

  const scrollYRef = useRef(0);
  const lastTimestampRef = useRef<number | null>(null);
  const pauseUntilRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  const totalHeight = lines.length * lineHeightPx;
  const pixelsPerMs = totalHeight > 0
    ? (wpm / wordsPerLine) * lineHeightPx / 60000
    : 0;

  const tick = useCallback(
    (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const deltaMs = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      // Handle pause
      if (pauseUntilRef.current !== null) {
        if (timestamp < pauseUntilRef.current) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        pauseUntilRef.current = null;
      }

      const newScrollY = scrollYRef.current + pixelsPerMs * deltaMs;
      const maxScroll = totalHeight;

      if (newScrollY >= maxScroll) {
        scrollYRef.current = maxScroll;
        setState({
          scrollY: maxScroll,
          currentLineIndex: lines.length - 1,
          progress: 1,
          elapsedMs: 0,
          isComplete: true,
        });
        return;
      }

      scrollYRef.current = newScrollY;
      const currentLine = Math.floor(newScrollY / lineHeightPx);

      // Check for pause marker on current line
      if (
        currentLine < lines.length &&
        lines[currentLine].trim() === PAUSE_MARKER &&
        pauseUntilRef.current === null
      ) {
        pauseUntilRef.current = timestamp + PAUSE_DURATION_MS;
      }

      setState({
        scrollY: newScrollY,
        currentLineIndex: Math.min(currentLine, lines.length - 1),
        progress: maxScroll > 0 ? newScrollY / maxScroll : 0,
        elapsedMs: 0,
        isComplete: false,
      });

      rafRef.current = requestAnimationFrame(tick);
    },
    [pixelsPerMs, totalHeight, lineHeightPx, lines]
  );

  useEffect(() => {
    if (isPlaying && !state.isComplete) {
      lastTimestampRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, tick, state.isComplete]);

  const reset = useCallback(() => {
    scrollYRef.current = 0;
    lastTimestampRef.current = null;
    pauseUntilRef.current = null;
    setState({
      scrollY: 0,
      currentLineIndex: 0,
      progress: 0,
      elapsedMs: 0,
      isComplete: false,
    });
  }, []);

  return { ...state, reset } as ScrollState & { reset: () => void };
}
