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
  isMirrored?: boolean;
  onToggleMirror?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
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
  isMirrored,
  onToggleMirror,
  isFullscreen,
  onToggleFullscreen,
}: ControlsProps) {
  return (
    <div
      className="fixed bottom-0 left-0 w-full z-30 transition-opacity duration-300 px-4 safe-bottom"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        className="max-w-[800px] mx-auto flex items-center gap-3 rounded-xl px-4 py-3 mb-2"
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Play/Pause */}
        <button
          onClick={onTogglePlay}
          className="p-2 text-white hover:text-text transition-colors shrink-0 rounded-lg hover:bg-white/5"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
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
            className="flex-1"
          />
          <span className="text-white/60 text-[11px] whitespace-nowrap w-16 text-right tabular-nums">
            {wpm} WPM
          </span>
        </div>

        {/* Font size */}
        <div className="flex items-center gap-0.5 shrink-0">
          {FONT_SIZES.map((fs, i) => (
            <button
              key={fs.label}
              onClick={() => onFontSizeChange(i)}
              className={`px-2 py-1 text-[11px] rounded transition-colors ${
                i === fontSizeIndex
                  ? "bg-text text-bg font-bold"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {fs.label}
            </button>
          ))}
        </div>

        {/* Mirror */}
        {onToggleMirror && (
          <button
            onClick={onToggleMirror}
            className={`p-2 transition-colors shrink-0 rounded-lg hover:bg-white/5 ${
              isMirrored ? "text-text" : "text-white/40 hover:text-white"
            }`}
            aria-label="Toggle mirror"
            title="Mirror (M)"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ transform: isMirrored ? "scaleX(-1)" : undefined }}
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3" />
              <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
              <line
                x1="12"
                y1="3"
                x2="12"
                y2="21"
                strokeDasharray="2 2"
              />
            </svg>
          </button>
        )}

        {/* Fullscreen */}
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className={`p-2 transition-colors shrink-0 rounded-lg hover:bg-white/5 ${
              isFullscreen ? "text-text" : "text-white/40 hover:text-white"
            }`}
            aria-label="Toggle fullscreen"
            title="Fullscreen (F)"
          >
            {isFullscreen ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
              </svg>
            )}
          </button>
        )}

        {/* Reset */}
        <button
          onClick={onReset}
          className="p-2 text-white/40 hover:text-white transition-colors shrink-0 rounded-lg hover:bg-white/5"
          aria-label="Reset"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
      </div>
    </div>
  );
}
