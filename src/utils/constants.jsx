// utils/constants.jsx
/** 3×3 8-puzzle */
export const BOARD_SIZE = 3;

export const GOAL = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 0]);

/** Generic direction list (not UI-specific order) */
export const DIRS = Object.freeze(['up', 'down', 'left', 'right']);

/** UI layout order for ArrowPad grid: row1: up, row2: left . right, row3: down */
export const PAD_DIRS = Object.freeze(['up', 'left', 'right', 'down']);

export const DIR_TO_DELTA = Object.freeze({
  up:   -BOARD_SIZE,
  down: +BOARD_SIZE,
  left: -1,
  right:+1,
});

/** Handy opposites (optional, useful in solvers/animations) */
export const OPPOSITE_DIR = Object.freeze({
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
});

export const codeToDir = Object.freeze({ U: 'up', D: 'down', L: 'left', R: 'right' });
export const dirToCode = Object.freeze({ up: 'U', down: 'D', left: 'L', right: 'R' });

// tiny helpers (handy in services/steps)
export const toDir  = (c) => (typeof c === 'string' ? codeToDir[c.toUpperCase()] ?? null : null);
export const toCode = (d) => dirToCode[d] ?? null;
