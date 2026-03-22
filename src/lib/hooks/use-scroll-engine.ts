import { useCallback, useEffect, useRef, useState } from "react";
import { wordCount } from "../wpm";
import { PAUSE_DURATION_MS } from "../constants";

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
  const pauseUntilRef = useRef<number | null>(null);
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

      // Handle active pause
      if (pauseUntilRef.current !== null) {
        if (timestamp < pauseUntilRef.current) {
          lastTimestampRef.current = timestamp;
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        pauseUntilRef.current = null;
      }

      const deltaMs = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      const el = containerRef.current;
      if (!el) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const scrollableHeight = el.scrollHeight - el.clientHeight;
      const pixelsPerMs = getPixelsPerMs();
      const newScrollTop = scrollTopRef.current + pixelsPerMs * deltaMs;

      if (newScrollTop >= scrollableHeight) {
        scrollTopRef.current = scrollableHeight;
        el.scrollTop = scrollableHeight;
        setState({ scrollTop: scrollableHeight, progress: 1, isComplete: true });
        return;
      }

      scrollTopRef.current = newScrollTop;
      el.scrollTop = newScrollTop;

      // Check if any pause element is at the focal point (~40% of viewport)
      if (pauseElements?.current) {
        const focalY = el.getBoundingClientRect().top + el.clientHeight * 0.4;
        pauseElements.current.forEach((pauseEl, i) => {
          if (!pauseEl || pausedIndicesRef.current.has(i)) return;
          const rect = pauseEl.getBoundingClientRect();
          if (rect.top <= focalY && rect.bottom >= focalY - 20) {
            pausedIndicesRef.current.add(i);
            pauseUntilRef.current = timestamp + PAUSE_DURATION_MS;
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

  // Skip forward/back by adjusting scrollTop
  const skip = useCallback(
    (deltaSeconds: number) => {
      const el = containerRef.current;
      if (!el) return;
      const pixelsPerMs = getPixelsPerMs();
      const deltaPixels = pixelsPerMs * deltaSeconds * 1000;
      const scrollableHeight = el.scrollHeight - el.clientHeight;
      const newTop = Math.max(0, Math.min(scrollTopRef.current + deltaPixels, scrollableHeight));
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
    pauseUntilRef.current = null;
    pausedIndicesRef.current = new Set();
    const el = containerRef.current;
    if (el) el.scrollTop = 0;
    setState({ scrollTop: 0, progress: 0, isComplete: false });
  }, [containerRef]);

  return { ...state, reset, skip };
}
