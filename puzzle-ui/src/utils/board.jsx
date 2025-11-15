// utils/board.jsx

import { BOARD_SIZE, DIR_TO_DELTA, codeToDir, GOAL } from './constants.jsx';
export { BOARD_SIZE, DIR_TO_DELTA, codeToDir, GOAL } from './constants.jsx';
export { deepEq, manhattan } from './heuristics.jsx';

const DIRS = Object.freeze(['up', 'down', 'left', 'right']);

export const isGoal = (state, goal = GOAL) =>
  Array.isArray(state) &&
  Array.isArray(goal) &&
  state.length === goal.length &&
  state.every((v, i) => v === goal[i]);

export const blankIndex = (state) => state.indexOf(0);

export function canMove(dir, state) {
  const idx = blankIndex(state);
  if (idx < 0) return false;
  if (dir === 'up')    return idx >= BOARD_SIZE;
  if (dir === 'down')  return idx < BOARD_SIZE * (BOARD_SIZE - 1);
  if (dir === 'left')  return (idx % BOARD_SIZE) !== 0;
  if (dir === 'right') return (idx % BOARD_SIZE) !== (BOARD_SIZE - 1);
  return false;
}

export function applyMove(dir, state) {
  if (!DIRS.includes(dir) || !canMove(dir, state)) return state;
  const idx = blankIndex(state);
  const target = idx + DIR_TO_DELTA[dir];
  const next = state.slice();
  [next[idx], next[target]] = [next[target], next[idx]];
  return next;
}

export function applyMoveCode(code, state) {
  const m = String(code).trim().toUpperCase();
  const dir = codeToDir[m];
  return dir ? applyMove(dir, state) : state;
}

export function neighbors(state) {
  return DIRS
    .filter((d) => canMove(d, state))
    .map((d) => [d, applyMove(d, state)]);
}

// 8-puzzle solvability: even inversion count (blank ignored) on odd-width board
export function isSolvable(state) {
  const arr = state.filter((v) => v !== 0);
  let inv = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) inv++;
    }
  }
  return inv % 2 === 0;
}
