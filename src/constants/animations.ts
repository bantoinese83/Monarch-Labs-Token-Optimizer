// Animation canvas sizes
export const CANVAS_SIZES = {
  MAIN_LOADER: 180,
  BUTTON_LOADER: 16,
} as const;

// Animation speed and timing
export const ANIMATION_CONFIG = {
  GLOBAL_SPEED: 0.5,
  MONOCHROME_COLOR: {
    R: 255,
    G: 255,
    B: 255,
  },
} as const;

// Helper function for monochrome fill
export const createMonochromeFill = (opacity: number): string => {
  const clampedOpacity = Math.max(0, Math.min(1, opacity));
  return `rgba(${ANIMATION_CONFIG.MONOCHROME_COLOR.R}, ${ANIMATION_CONFIG.MONOCHROME_COLOR.G}, ${ANIMATION_CONFIG.MONOCHROME_COLOR.B}, ${clampedOpacity})`;
};

// Helper function for monochrome stroke
export const createMonochromeStroke = (opacity: number): string => {
  return createMonochromeFill(opacity);
};
