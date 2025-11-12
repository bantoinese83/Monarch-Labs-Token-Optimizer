// UI dimensions and sizes
export const UI_SIZES = {
  MAX_CONTENT_WIDTH: 1400,
  SIDEBAR_WIDTH: 256, // 64 * 4 (w-64)
  TOAST_MIN_WIDTH: 300,
  TOAST_MAX_WIDTH: 448, // max-w-md
  LOADER_SELECTOR_MIN_WIDTH: 200,
  LOADER_SELECTOR_MAX_HEIGHT: 256, // max-h-64
  HISTORY_ITEM_LIMIT: 20,
  BADGE_FONT_SIZE: 10, // text-[10px]
  RESULT_CARD_HEIGHT: 600, // Fixed height for result cards (px)
  RESULT_CARD_CODE_AREA_MIN_HEIGHT: 300, // Minimum height for code area
} as const;
