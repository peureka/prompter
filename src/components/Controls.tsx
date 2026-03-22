import { FONT_SIZES } from "../lib/constants";

interface ControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  wpm: number;
  onWpmChange: (wpm: number) => void;
  wpmMin: number;
  wpmMax: number;
  fontSizeIndex: number;
  onFontSizeChange: (index: number) => void;
  onReset: () => void;
  visible: boolean;
}

export function Controls({
  isPlaying,
  onTogglePlay,
  wpm,
  onWpmChange,
  wpmMin,
  wpmMax,
  fontSizeIndex,
  onFontSizeChange,
  onReset,
  visible,
}: ControlsProps) {
  return (
    <div
      className="fixed bottom-[2px] left-0 w-full z-30 transition-opacity duration-300 px-4 pb-4"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
    >
      <div className="max-w-[800px] mx-auto flex items-center gap-4 rounded-lg px-4 py-3"
        style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}
      >
        {/* Play/Pause */}
        <button
          onClick={onTogglePlay}
          className="text-white hover:text-text transition-colors shrink-0"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6,4 20,12 6,20" />
            </svg>
          )}
        </button>

        {/* Speed slider */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input
            type="range"
            min={wpmMin}
            max={wpmMax}
            value={wpm}
            onChange={(e) => onWpmChange(Number(e.target.value))}
            className="flex-1 accent-text"
          />
          <span className="text-white text-xs whitespace-nowrap w-16 text-right">
            {wpm} WPM
          </span>
        </div>

        {/* Font size */}
        <div className="flex items-center gap-1 shrink-0">
          {FONT_SIZES.map((fs, i) => (
            <button
              key={fs.label}
              onClick={() => onFontSizeChange(i)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                i === fontSizeIndex
                  ? "bg-text text-bg"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {fs.label}
            </button>
          ))}
        </div>

        {/* Reset */}
        <button
          onClick={onReset}
          className="text-white/50 hover:text-white transition-colors shrink-0"
          aria-label="Reset"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
      </div>
    </div>
  );
}
