import { useEffect, useRef } from "react";

interface GestureActions {
  onTap: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const MIN_SWIPE_DISTANCE = 50;
const MAX_TAP_DURATION = 300;
const MAX_TAP_DISTANCE = 10;

export function useGestures(
  ref: React.RefObject<HTMLElement | null>,
  actions: GestureActions
) {
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(
    null
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      touchStart.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      if (e.changedTouches.length !== 1) return;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;
      const dt = Date.now() - touchStart.current.time;
      const distance = Math.sqrt(dx * dx + dy * dy);

      touchStart.current = null;

      // Tap detection
      if (distance < MAX_TAP_DISTANCE && dt < MAX_TAP_DURATION) {
        actions.onTap();
        return;
      }

      // Swipe detection (horizontal only)
      if (Math.abs(dx) > MIN_SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) actions.onSwipeLeft();
        else actions.onSwipeRight();
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [ref, actions]);
}
