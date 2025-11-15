// services/puzzleService.jsx
import { get, post } from "./apiClient.jsx";

// --- API wrappers ---
export const shuffleRemote = (steps = 80, opts) =>
  get("/shuffle", { query: { steps: Number.isFinite(+steps) ? +steps : 80 }, ...opts });

export const solveRemote = (startState, selectedAlgorithm, opts) =>
  post("/solve", { startState, selectedAlgorithm }, opts);

// --- helpers ---
const toNum = (v) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

export function extractShuffledBoard(payload) {
  const raw =
    payload?.shuffledState ??
    payload?.shuffled ??
    payload?.state ??
    payload;

  if (!Array.isArray(raw) || raw.length !== 9) return null;
  const arr = raw.map(toNum);
  return arr.some((n) => n === null) ? null : arr;
}

export function normalizeSolveResult(payload) {
  const moves = Array.isArray(payload?.moves)
    ? payload.moves.map((m) => String(m).toUpperCase()).filter((m) => /^[UDLR]$/.test(m))
    : [];

  const trace = Array.isArray(payload?.trace)
    ? payload.trace.map((t) => ({ g: toNum(t.g), h: toNum(t.h), f: toNum(t.f) }))
    : undefined;

  return {
    moves,
    trace,
    nodesExpanded: toNum(payload?.expandedNodeCount), // ← correct key
    solveMs: toNum(payload?.solveTimeMs),            // ← correct key
  };
}
