import { useCallback, useEffect, useRef, useState } from "react";

interface FlashState {
  currentWord: string;
  wordIndex: number;
  progress: number;
  isComplete: boolean;
  elapsedMs: number;
  actualWpm: number;
  totalWords: number;
}

interface UseFlashEngineOptions {
  words: string[];
  wpm: number;
  isPlaying: boolean;
}

function getWordDelay(word: string, baseMs: number): number {
  let multiplier = 1;

  // Punctuation pauses
  if (/[.!?]$/.test(word)) multiplier = 1.5;
  else if (/[,;:]$/.test(word)) multiplier = 1.2;

  // Long word bonus (7+ chars)
  const len = word.replace(/[^a-zA-Z]/g, "").length;
  if (len >= 7) multiplier *= 1 + (len - 7) * 0.1;

  return baseMs * multiplier;
}

export function useFlashEngine({
  words,
  wpm,
  isPlaying,
}: UseFlashEngineOptions) {
  const [state, setState] = useState<FlashState>({
    currentWord: words[0] || "",
    wordIndex: 0,
    progress: 0,
    isComplete: false,
    elapsedMs: 0,
    actualWpm: 0,
    totalWords: words.length,
  });

  const wordIndexRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const nextWordAtRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const baseMs = 60000 / wpm;

  const tick = useCallback(
    (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
        nextWordAtRef.current = timestamp + getWordDelay(words[0] || "", baseMs);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (timestamp >= nextWordAtRef.current) {
        const nextIndex = wordIndexRef.current + 1;

        if (nextIndex >= words.length) {
          const elapsed = timestamp - startTimeRef.current;
          const actualWpm = elapsed > 0 ? (words.length / elapsed) * 60000 : 0;
          setState({
            currentWord: words[words.length - 1] || "",
            wordIndex: words.length - 1,
            progress: 1,
            isComplete: true,
            elapsedMs: elapsed,
            actualWpm: Math.round(actualWpm),
            totalWords: words.length,
          });
          return;
        }

        wordIndexRef.current = nextIndex;
        nextWordAtRef.current =
          timestamp + getWordDelay(words[nextIndex], baseMs);

        const elapsed = timestamp - startTimeRef.current;
        setState({
          currentWord: words[nextIndex],
          wordIndex: nextIndex,
          progress: nextIndex / (words.length - 1),
          isComplete: false,
          elapsedMs: elapsed,
          actualWpm: Math.round(elapsed > 0 ? (nextIndex / elapsed) * 60000 : 0),
          totalWords: words.length,
        });
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [words, baseMs]
  );

  useEffect(() => {
    if (isPlaying && !state.isComplete) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, tick, state.isComplete]);

  const reset = useCallback(() => {
    wordIndexRef.current = 0;
    startTimeRef.current = null;
    nextWordAtRef.current = 0;
    setState({
      currentWord: words[0] || "",
      wordIndex: 0,
      progress: 0,
      isComplete: false,
      elapsedMs: 0,
      actualWpm: 0,
      totalWords: words.length,
    });
  }, [words]);

  return { ...state, reset };
}
