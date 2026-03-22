import { useEffect } from "react";

interface KeyboardActions {
  onTogglePlay: () => void;
  onSpeedUp: () => void;
  onSpeedDown: () => void;
  onSkipForward: () => void;
  onSkipBack: () => void;
  onExit: () => void;
  onToggleMirror?: () => void;
  onToggleFullscreen?: () => void;
  onToggleHelp?: () => void;
}

export function useKeyboard(actions: KeyboardActions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          actions.onTogglePlay();
          break;
        case "ArrowUp":
          e.preventDefault();
          actions.onSpeedUp();
          break;
        case "ArrowDown":
          e.preventDefault();
          actions.onSpeedDown();
          break;
        case "ArrowRight":
          e.preventDefault();
          actions.onSkipForward();
          break;
        case "ArrowLeft":
          e.preventDefault();
          actions.onSkipBack();
          break;
        case "Escape":
          e.preventDefault();
          actions.onExit();
          break;
        case "KeyM":
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            actions.onToggleMirror?.();
          }
          break;
        case "KeyF":
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            actions.onToggleFullscreen?.();
          }
          break;
        case "Slash":
          if (e.shiftKey) {
            // ? key
            e.preventDefault();
            actions.onToggleHelp?.();
          }
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [actions]);
}
