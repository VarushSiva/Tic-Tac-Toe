// Constants
export const GRID_SIZE = 3;
export const CELL_COUNT = 9;
export const DEFAULT_TIMER_DURATION = 15;
export const TIMER_WARNING_THRESHOLD_RATIO = 1 / 3;
export const AI_MOVE_DELAY = 500;
export const AUTO_MOVE_HIGHLIGHT_DELAY = 500;

export const ARIA = {
    HIDDEN: "aria-hidden",
    TRUE: "true",
    FALSE: "false",
} as const;

export const WIN_CONDITIONS: [number, number, number][] = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6],            // Diagonals
]

export const STORAGE_KEYS = {
    THEME: "theme",
    REDUCE_MOTION: "reduceMotion",
    HIGH_CONTRAST: "highContrast",
    LARGE_TEXT: "largeText",
    TIMER_ENABLED: "timerEnabled",
    TIMER_DURATION: "timerDuration",
} as const;