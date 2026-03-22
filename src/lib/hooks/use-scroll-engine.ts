import { useCallback, useEffect, useRef, useState } from "react";
import { wordCount } from "../wpm";
import { PAUSE_DURATION_MS } from "../constants";

const FOCAL_RATIO = 0.38;
const EASE_DURATION_MS = 300; // decel/accel duration around pauses

interface ScrollState {
  scrollTop: number;
  progress: number;
  isComplete: boolean;
}

interface UseScrollEngineOptions {
  text: string;
  wpm: number;
  isPlaying: boolean;
  containerRef: React.RefObject<HTMLElement | null>;
  pauseElements?: React.RefObject<(HTMLElement | null)[]>;
}

export function useScrollEngine({
  text,
  wpm,
  isPlaying,
  containerRef,
  pauseElements,
}: UseScrollEngineOptions) {
  const [state, setState] = useState<ScrollState>({
    scrollTop: 0,
    progress: 0,
    isComplete: false,
  });

  const scrollTopRef = useRef(0);
  const lastTimestampRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  // Pause state
  const pausePhaseRef = useRef<"none" | "decel" | "hold" | "accel">("none");
  const pausePhaseStartRef = useRef<number>(0);
  const pausedIndicesRef = useRef<Set<number>>(new Set());

  const getPixelsPerMs = useCallback(() => {
    const el = containerRef.current;
    if (!el) return 0;
    const scrollableHeight = el.scrollHeight - el.clientHeight;
    if (scrollableHeight <= 0) return 0;
    const totalWords = wordCount(text);
    const totalMs = (totalWords / wpm) * 60000;
    return totalMs > 0 ? scrollableHeight / totalMs : 0;
  }, [containerRef, text, wpm]);

  const tick = useCallback(
    (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const deltaMs = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      const el = containerRef.current;
      if (!el) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // Calculate speed multiplier based on pause phase
      let speedMultiplier = 1;
      const phase = pausePhaseRef.current;

      if (phase === "decel") {
        const elapsed = timestamp - pausePhaseStartRef.current;
        if (elapsed >= EASE_DURATION_MS) {
          pausePhaseRef.current = "hold";
          pausePhaseStartRef.current = timestamp;
          speedMultiplier = 0;
        } else {
          speedMultiplier = 1 - elapsed / EASE_DURATION_MS;
        }
      } else if (phase === "hold") {
        const elapsed = timestamp - pausePhaseStartRef.current;
        if (elapsed >= PAUSE_DURATION_MS) {
          pausePhaseRef.current = "accel";
          pausePhaseStartRef.current = timestamp;
        }
        speedMultiplier = 0;
      } else if (phase === "accel") {
        const elapsed = timestamp - pausePhaseStartRef.current;
        if (elapsed >= EASE_DURATION_MS) {
          pausePhaseRef.current = "none";
          speedMultiplier = 1;
        } else {
          speedMultiplier = elapsed / EASE_DURATION_MS;
        }
      }

      const scrollableHeight = el.scrollHeight - el.clientHeight;
      const pixelsPerMs = getPixelsPerMs();
      const newScrollTop =
        scrollTopRef.current + pixelsPerMs * deltaMs * speedMultiplier;

      if (newScrollTop >= scrollableHeight) {
        scrollTopRef.current = scrollableHeight;
        el.scrollTop = scrollableHeight;
        setState({
          scrollTop: scrollableHeight,
          progress: 1,
          isComplete: true,
        });
        return;
      }

      scrollTopRef.current = newScrollTop;
      el.scrollTop = newScrollTop;

      // Check pause elements at focal point
      if (pauseElements?.current && pausePhaseRef.current === "none") {
        const focalY =
          el.getBoundingClientRect().top + el.clientHeight * FOCAL_RATIO;
        pauseElements.current.forEach((pauseEl, i) => {
          if (!pauseEl || pausedIndicesRef.current.has(i)) return;
          const rect = pauseEl.getBoundingClientRect();
          if (rect.top <= focalY && rect.bottom >= focalY - 20) {
            pausedIndicesRef.current.add(i);
            pausePhaseRef.current = "decel";
            pausePhaseStartRef.current = timestamp;
          }
        });
      }

      setState({
        scrollTop: newScrollTop,
        progress: scrollableHeight > 0 ? newScrollTop / scrollableHeight : 0,
        isComplete: false,
      });

      rafRef.current = requestAnimationFrame(tick);
    },
    [containerRef, getPixelsPerMs, pauseElements]
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

  const skip = useCallback(
    (deltaSeconds: number) => {
      const el = containerRef.current;
      if (!el) return;
      const pixelsPerMs = getPixelsPerMs();
      const deltaPixels = pixelsPerMs * deltaSeconds * 1000;
      const scrollableHeight = el.scrollHeight - el.clientHeight;
      const newTop = Math.max(
        0,
        Math.min(scrollTopRef.current + deltaPixels, scrollableHeight)
      );
      scrollTopRef.current = newTop;
      el.scrollTop = newTop;
      setState((s) => ({
        ...s,
        scrollTop: newTop,
        progress: scrollableHeight > 0 ? newTop / scrollableHeight : 0,
      }));
    },
    [containerRef, getPixelsPerMs]
  );

  const reset = useCallback(() => {
    scrollTopRef.current = 0;
    lastTimestampRef.current = null;
    pausePhaseRef.current = "none";
    pausedIndicesRef.current = new Set();
    const el = containerRef.current;
    if (el) el.scrollTop = 0;
    setState({ scrollTop: 0, progress: 0, isComplete: false });
  }, [containerRef]);

  return { ...state, reset, skip };
}
