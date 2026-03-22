export function wpmToMsPerWord(wpm: number): number {
  return 60000 / wpm;
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function estimatedDurationSeconds(text: string, wpm: number): number {
  const words = wordCount(text);
  return (words / wpm) * 60;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

/**
 * Convert WPM to pixels-per-millisecond for scroll mode.
 * Assumes each line holds ~wordsPerLine words.
 */
export function wpmToPixelsPerMs(
  wpm: number,
  lineHeightPx: number,
  wordsPerLine: number
): number {
  const linesPerMinute = wpm / wordsPerLine;
  const pixelsPerMinute = linesPerMinute * lineHeightPx;
  return pixelsPerMinute / 60000;
}
