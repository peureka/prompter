export const SCROLL_WPM_MIN = 80;
export const SCROLL_WPM_MAX = 400;
export const SCROLL_WPM_DEFAULT = 150;

export const FLASH_WPM_MIN = 100;
export const FLASH_WPM_MAX = 600;
export const FLASH_WPM_DEFAULT = 200;

export const COUNTDOWN_SECONDS = 3;

export const PAUSE_MARKER = "//pause";
export const PAUSE_DURATION_MS = 2000;

export const CONTROLS_HIDE_DELAY = 3000;

export const FONT_SIZES = [
  { label: "S", size: 1.125 },
  { label: "M", size: 1.5 },
  { label: "L", size: 2 },
  { label: "XL", size: 2.75 },
] as const;

export const FONT_SIZE_DEFAULT = 2; // index into FONT_SIZES (L)
