interface KeyboardHelpProps {
  onClose: () => void;
}

const shortcuts = [
  ["Space", "Play / Pause"],
  ["\u2191 / \u2193", "Speed \u00b110 WPM"],
  ["\u2190 / \u2192", "Skip back / forward"],
  ["Esc", "Exit to sessions"],
  ["M", "Toggle mirror"],
  ["F", "Toggle fullscreen"],
  ["?", "This help"],
];

export function KeyboardHelp({ onClose }: KeyboardHelpProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white/10 rounded-xl p-6 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-text font-bold text-lg mb-4">Keyboard Shortcuts</h2>
        <div className="flex flex-col gap-2">
          {shortcuts.map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-white/40 text-sm">{desc}</span>
              <kbd className="px-2 py-0.5 rounded bg-white/10 text-text text-xs font-mono">
                {key}
              </kbd>
            </div>
          ))}
        </div>
        <p className="text-white/20 text-xs mt-4 text-center">
          Press ? or tap anywhere to close
        </p>
      </div>
    </div>
  );
}
