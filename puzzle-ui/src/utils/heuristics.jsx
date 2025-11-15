// utils/heuristics.js (3×3 only)

export const deepEq = (a, b) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

// Precomputed goal positions for values 1..8 (row, col)
const GOAL_POS = [
  null,
  [0, 0], [0, 1], [0, 2],
  [1, 0], [1, 1], [1, 2],
  [2, 0], [2, 1],
];

export function manhattan(state) {
  let d = 0;
  for (let i = 0; i < 9; i++) {
    const v = state[i];
    if (v === 0) continue;
    const r = (i / 3) | 0, c = i % 3;
    const [gr, gc] = GOAL_POS[v];
    d += Math.abs(r - gr) + Math.abs(c - gc);
  }
  return d;
}
