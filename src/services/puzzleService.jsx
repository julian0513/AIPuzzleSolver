// services/puzzleService.jsx
import { get, post } from './apiClient.jsx';

// ------- helpers -------
const toNum = (v) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null; // no NaN leaks
};

// ---- same API you already use ----
export const shuffleRemote = (steps = 80, opts) =>
  get('/shuffle', { query: { steps: toNum(steps) ?? 80 }, ...opts });

export const solveRemote = (
  startState,
  selectedAlgorithm,
  requestTrace = false,
  opts
) => post('/solve', { startState, selectedAlgorithm, requestTrace }, opts);

// ---- optional helpers (nice to have) ----
export function extractShuffledBoard(payload) {
  const raw =
    payload?.shuffledState ??
    payload?.shuffled ??
    payload?.state ??
    payload;

  if (!Array.isArray(raw) || raw.length !== 9) return null;

  const arr = raw.map(toNum);
  if (arr.some((n) => n === null)) return null;

  // (optional) sanity check range & uniqueness; keep permissive if you prefer:
  // if (new Set(arr).size !== 9 || arr.some((n) => n < 0 || n > 8)) return null;

  return arr;
}

export function normalizeSolveResult(payload) {
  const moves = Array.isArray(payload?.moves)
    ? payload.moves
        .map((m) => String(m).toUpperCase())
        .filter((m) => /^[UDLR]$/.test(m))
    : [];

  const trace = Array.isArray(payload?.trace)
    ? payload.trace.map((t) => ({
        g: toNum(t.g),
        h: toNum(t.h),
        f: toNum(t.f),
      }))
    : undefined;

  return {
    moves,
    trace,
    nodesExpanded: toNum(payload?.nodesExpanded) ?? toNum(payload?.expandedCount) ?? null,
    solveMs: toNum(payload?.solverTimeMs) ?? toNum(payload?.timeMs) ?? null,
  };
}
