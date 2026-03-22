import { useCallback, useEffect, useRef, useState } from "react";
import { wordCount } from "../wpm";

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
}

export function useScrollEngine({
  text,
  wpm,
  isPlaying,
  containerRef,
}: UseScrollEngineOptions) {
  const [state, setState] = useState<ScrollState>({
    scrollTop: 0,
    progress: 0,
    isComplete: false,
  });

  const scrollTopRef = useRef(0);
  const lastTimestampRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  // Calculate scroll speed: pixels per millisecond
  // Total words / WPM = minutes to read. Convert to ms.
  // scrollHeight / totalMs = pixels per ms
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

      const scrollableHeight = el.scrollHeight - el.clientHeight;
      const pixelsPerMs = getPixelsPerMs();
      const newScrollTop = scrollTopRef.current + pixelsPerMs * deltaMs;

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

      setState({
        scrollTop: newScrollTop,
        progress: scrollableHeight > 0 ? newScrollTop / scrollableHeight : 0,
        isComplete: false,
      });

      rafRef.current = requestAnimationFrame(tick);
    },
    [containerRef, getPixelsPerMs]
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
    scrollTopRef.current = 0;
    lastTimestampRef.current = null;
    const el = containerRef.current;
    if (el) el.scrollTop = 0;
    setState({
      scrollTop: 0,
      progress: 0,
      isComplete: false,
    });
  }, [containerRef]);

  return { ...state, reset };
}
