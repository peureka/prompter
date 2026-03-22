import { useCallback, useEffect, useRef, useState } from "react";
import { CONTROLS_HIDE_DELAY } from "../constants";

export function useAutoHide(isPlaying: boolean) {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const resetTimer = useCallback(() => {
    setVisible(true);
    clearTimeout(timerRef.current);
    if (isPlaying) {
      timerRef.current = setTimeout(() => setVisible(false), CONTROLS_HIDE_DELAY);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      setVisible(true);
      clearTimeout(timerRef.current);
      return;
    }

    resetTimer();

    const onMove = () => resetTimer();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchstart", onMove);

    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchstart", onMove);
    };
  }, [isPlaying, resetTimer]);

  return { controlsVisible: visible, onInteraction: resetTimer };
}
