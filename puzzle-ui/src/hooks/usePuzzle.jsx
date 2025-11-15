import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { DIR_TO_DELTA, GOAL } from '../utils/constants';
import { deepEq, manhattan } from '../utils/heuristics';
import { shuffleRemote, solveRemote } from '../services/puzzleService';

export function usePuzzle() {
  const [algorithm, setAlgorithm] = useState('astar');
  const [board, setBoard] = useState([...GOAL]);
  const [tileImages, setTileImages] = useState(Array(9).fill(null));
  const solved = useMemo(() => deepEq(board, GOAL), [board]);

  // ---- Timer
  const [ms, setMs] = useState(0);
  const runningRef = useRef(false);
  const startTsRef = useRef(0);
  const timerIdRef = useRef(null);

  const startTimer = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    startTsRef.current = performance.now() - ms;
    timerIdRef.current = setInterval(() => setMs(performance.now() - startTsRef.current), 100);
  }, [ms]);

  const stopTimer = useCallback(() => {
    if (timerIdRef.current) clearInterval(timerIdRef.current);
    timerIdRef.current = null;
    runningRef.current = false;
  }, []);

  const resetTimer = useCallback(() => { stopTimer(); setMs(0); }, [stopTimer]);

  useEffect(() => { if (solved) stopTimer(); }, [solved, stopTimer]);
  useEffect(() => () => { if (timerIdRef.current) clearInterval(timerIdRef.current); }, []);

  // ---- Coach
  const [coach, setCoach] = useState(false);
  const [arrowEval, setArrowEval] = useState({});

  // Pure canMove; add a convenience wrapper for current board
  const canMove = useCallback((dir, state) => {
    const idx = state.indexOf(0);
    if (dir === 'up') return idx >= 3;
    if (dir === 'down') return idx <= 5;
    if (dir === 'left') return idx % 3 !== 0;
    if (dir === 'right') return idx % 3 !== 2;
    return false;
  }, []);
  const canMoveCurrent = useCallback((dir) => canMove(dir, board), [canMove, board]);

  const move = useCallback((dir) => {
    // Use functional update to avoid stale board on rapid clicks
    let moved = false;
    setBoard(prev => {
      if (!canMove(dir, prev)) return prev;
      const idx = prev.indexOf(0);
      const target = idx + DIR_TO_DELTA[dir];
      if ((dir === 'left' || dir === 'right') && Math.floor(idx/3) !== Math.floor(target/3)) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      moved = true;
      return next;
    });
    if (moved && !runningRef.current) startTimer();
    return moved;
  }, [canMove, startTimer]);

  // Pure helper for steps playback
  const applyMoveCode = useCallback((code, state) => {
    const m = String(code).toUpperCase();
    const map = { U: 'up', D: 'down', L: 'left', R: 'right' };
    const dir = map[m];
    if (!dir || !canMove(dir, state)) return state;
    const idx = state.indexOf(0), target = idx + DIR_TO_DELTA[dir];
    const next = [...state];
    [next[idx], next[target]] = [next[target], next[idx]];
    return next;
  }, [canMove]);

  // Coach Δh coloring
  useEffect(() => {
    if (!coach) { setArrowEval({}); return; }
    const evals = {};
    const h0 = manhattan(board);
    ['up','down','left','right'].forEach(dir => {
      if (!canMoveCurrent(dir)) return;
      const idx = board.indexOf(0), tgt = idx + DIR_TO_DELTA[dir];
      const next = [...board];
      [next[idx], next[tgt]] = [next[tgt], next[idx]];
      const dh = manhattan(next) - h0;
      evals[dir] = dh < 0 ? 'good' : dh === 0 ? 'ok' : 'bad';
    });
    setArrowEval(evals);
  }, [coach, board, canMoveCurrent]);

  // ---- Hint flash
  const [hintDir, setHintDir] = useState(null);
  const [pressedDir, setPressedDir] = useState(null);
  const pressTimerRef = useRef(null);
  const flashArrow = useCallback((dir) => {
    setPressedDir(null);
    requestAnimationFrame(() => {
      setPressedDir(dir);
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = setTimeout(() => setPressedDir(null), 200);
    });
  }, []);
  useEffect(() => () => clearTimeout(pressTimerRef.current), []);

  // ---- Shuffle / Hint
  const shuffle = useCallback(async () => {
    try {
      const data = await shuffleRemote(80);
      const state = data.shuffledState || data.shuffled;
      if (Array.isArray(state) && state.length === 9) {
        setBoard(state);
        resetTimer(); startTimer();
        return;
      }
      throw new Error('Bad shuffle payload');
    } catch {
      // functional fallback randomizer
      setBoard(prev => {
        let s = [...prev];
        for (let i = 0; i < 50; i++) {
          const options = ['up','down','left','right'].filter(d => canMove(d, s));
          const d = options[Math.floor(Math.random() * options.length)];
          const idx = s.indexOf(0), target = idx + DIR_TO_DELTA[d];
          [s[idx], s[target]] = [s[target], s[idx]];
        }
        return s;
      });
      resetTimer(); startTimer();
    }
  }, [canMove, resetTimer, startTimer]);

  const [hintBusy, setHintBusy] = useState(false);
  const hintBusyRef = useRef(false);
  useEffect(() => { hintBusyRef.current = hintBusy; }, [hintBusy]);

  const hint = useCallback(async () => {
    if (hintBusyRef.current) return;
    setHintBusy(true);
    try {
      const data = await solveRemote(board, algorithm);
      const first = Array.isArray(data.moves) && data.moves[0];
      if (!first) return;
      const map = { U: 'up', D: 'down', L: 'left', R: 'right' };
      const dir = map[String(first).toUpperCase()];
      if (dir) {
        setHintDir(dir);
        setTimeout(() => setHintDir(null), 650);
      }
    } finally {
      setHintBusy(false);
    }
  }, [board, algorithm]);

  // ---- Derived labels
  const distance = useMemo(() => manhattan(board), [board]);
  const timerLabel = `${(ms / 1000).toFixed(1)} s`;
  const algorithmLabel = algorithm === 'astar' ? 'A*' : algorithm.toUpperCase();

  return {
    // state
    algorithm, setAlgorithm,
    board, setBoard,
    tileImages, setTileImages,
    solved,
    coach, setCoach,
    arrowEval,
    hintDir, pressedDir, flashArrow,
    hintBusy,
    ms,

    // metrics
    distance, timerLabel, algorithmLabel,

    // actions
    canMove: canMoveCurrent, move, shuffle, hint, applyMoveCode,

    // timer controls
    startTimer, stopTimer, resetTimer,
  };
}
