import { useEffect, useState } from "react";
import { COUNTDOWN_SECONDS } from "../lib/constants";

interface CountdownProps {
  onComplete: () => void;
}

export function Countdown({ onComplete }: CountdownProps) {
  const [count, setCount] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (count <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg">
      <span
        className="text-text font-bold transition-all duration-300"
        style={{ fontSize: "clamp(4rem, 15vw, 10rem)" }}
      >
        {count}
      </span>
    </div>
  );
}
