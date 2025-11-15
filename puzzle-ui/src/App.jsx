import { useEffect, useRef, useState } from "react";
import { makeFloatingShapes } from "./utils/shapes.jsx";
import { fireConfetti } from "./utils/confetti.jsx";
import { solveRemote } from "./services/puzzleService.jsx";

import { usePuzzle } from "./hooks/usePuzzle.jsx";
import useKeyboardControls from "./hooks/useKeyboardControls.jsx";

import Board from "./components/Board.jsx";
import StatusBar from "./components/StatusBar.jsx";
import ArrowPad from "./components/ArrowPad.jsx";
import ImageUpload from "./components/ImageUpload.jsx";
import AlgorithmDropdown from "./components/AlgorithmDropdown.jsx";
import SolutionPanel from "./components/SolutionPanel.jsx";

export default function App() {
  const {
    algorithm, setAlgorithm,
    board, setBoard, tileImages, setTileImages, solved,
    coach, setCoach, arrowEval,
    hintDir, pressedDir, flashArrow,
    distance, timerLabel, algorithmLabel,
    move, shuffle,
    startTimer, stopTimer, resetTimer,
    applyMoveCode,
  } = usePuzzle();

  const [showAlg, setShowAlg] = useState(false);
  const [showSol, setShowSol] = useState(false);

  const [solutionMoves, setSolutionMoves] = useState([]);
  const [pathStates, setPathStates] = useState(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [solLoading, setSolLoading] = useState(false);
  const [solError, setSolError] = useState(null);

  const [nodesExpanded, setNodesExpanded] = useState(null);
  const [solveMs, setSolveMs] = useState(null);
  const [capBadge, setCapBadge] = useState(null);

  const snapshotRef = useRef(null);
  const playIntRef = useRef(null);
  const lastSolvedKeyRef = useRef(null);

  const algBtnRef = useRef(null);
  const boardAnchorRef = useRef(null);

  useKeyboardControls({
    disabled: playing,
    onMove: (dir) => { move(dir); flashArrow(dir); },
    onFlash: flashArrow,
    preventScroll: true,
  });

  useEffect(() => { makeFloatingShapes(); }, []);
  useEffect(() => { if (solved) fireConfetti(); }, [solved]);

  const keyFor = (st, algo) => `${algo}|${st.join(",")}`;

   async function fetchSolutionForCurrentBoard() {
     setSolLoading(true);
     setSolError(null);
     try {
       clearInterval(playIntRef.current);
       setPlaying(false);

       snapshotRef.current = [...board];
       setStepIdx(0);
       const data = await solveRemote(snapshotRef.current, algorithm);
       const moves = Array.isArray(data.moves) ? data.moves : [];
       setSolutionMoves(moves);
       setPathStates(Array.isArray(data.pathStates) ? data.pathStates : null);

       setNodesExpanded(Number.isFinite(data.expandedNodeCount) ? data.expandedNodeCount : null);
       setSolveMs(Number.isFinite(data.solveTimeMs) ? data.solveTimeMs : null);
       setCapBadge(data.hitDepthCap ? `Depth cap ${data.maxDepth ?? ""}`.trim() : null);
       lastSolvedKeyRef.current = keyFor(snapshotRef.current, algorithm);
       stopTimer();
       return moves.length > 0;
     } catch (e) {
       setSolutionMoves([]);
       setNodesExpanded(null);
       setSolveMs(null);
       setCapBadge(null);
       setPathStates(null);
       setSolError((e && e.message) || "Solve failed");
       return false;
     } finally {
       setSolLoading(false);
     }
   }

  // Load solution when panel opens or algorithm changes while open
  useEffect(() => {
    if (!showSol) return;
    fetchSolutionForCurrentBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSol, algorithm]);

  useEffect(() => () => { clearInterval(playIntRef.current); }, []);

   async function ensureSolutionLoaded() {
     const currentKey = keyFor(board, algorithm);
     if (solLoading) return false;
     if (!solutionMoves.length || currentKey !== lastSolvedKeyRef.current) {
       return await fetchSolutionForCurrentBoard();
     }
     return true;
   }

 function trustedApplyMoveCode(code, state) {
   const m = String(code).toUpperCase();
   const delta = { U: -3, D: +3, L: -1, R: +1 }[m];
   if (delta == null) return state;
   const idx = state.indexOf(0);
   const t = idx + delta;
   const next = state.slice();
   [next[idx], next[t]] = [next[t], next[idx]];
   return next;
 }

  const onPrev = async () => {
    if (!(await ensureSolutionLoaded())) return;
    if (!snapshotRef.current || stepIdx === 0) return;
    if (pathStates && pathStates[stepIdx - 1]) {
     setBoard(pathStates[stepIdx - 1]);
   } else {
     let s = [...snapshotRef.current];
     for (let i = 0; i < stepIdx - 1; i++) s = trustedApplyMoveCode(solutionMoves[i], s);
     setBoard(s);
   }
    setStepIdx(stepIdx - 1);
  };

  const onNext = async () => {
    if (!(await ensureSolutionLoaded())) return;
    if (!snapshotRef.current || stepIdx >= solutionMoves.length) return;
   const code = solutionMoves[stepIdx];
   if (pathStates && pathStates[stepIdx + 1]) {
     setBoard(pathStates[stepIdx + 1]);
   } else {
     setBoard(prev => trustedApplyMoveCode(code, prev));
   }
    setStepIdx(stepIdx + 1);
    const dirMap = { U: "up", D: "down", L: "left", R: "right" };
    if (dirMap[code]) flashArrow(dirMap[code]);
  };

  const onResetSteps = async () => {
    if (!(await ensureSolutionLoaded())) return;
    if (!snapshotRef.current) return;
    setBoard(pathStates && pathStates[0] ? pathStates[0] : [...snapshotRef.current]);
    setStepIdx(0);
    setPlaying(false);
  };

  const onPlayPause = async () => {
    if (!(await ensureSolutionLoaded())) return;
    if (!snapshotRef.current) return;

    if (playing) {
      clearInterval(playIntRef.current);
      setPlaying(false);
      return;
    }
    setPlaying(true);
  if (stepIdx === 0) {
    setBoard(pathStates && pathStates[0] ? pathStates[0] : [...snapshotRef.current]);
  }

    playIntRef.current = setInterval(() => {
      setStepIdx((s) => {
        if (s >= solutionMoves.length) {
          clearInterval(playIntRef.current);
          setPlaying(false);
          return s;
        }
        const code = solutionMoves[s];
       if (pathStates && pathStates[s + 1]) {
         setBoard(pathStates[s + 1]);
       } else {
         setBoard(prev => trustedApplyMoveCode(code, prev));
       }
        const dirMap = { U: "up", D: "down", L: "left", R: "right" };
        if (dirMap[code]) flashArrow(dirMap[code]);
        return s + 1;
      });
    }, 450);
  };

  const toggleAlg = () => { setShowAlg(v => !v); if (!solved && !showSol) stopTimer(); };
  const toggleSol = () => { setShowSol(v => !v); if (!solved && !showAlg) stopTimer(); };
  const closeAlg = () => { setShowAlg(false); if (!solved && !showSol) startTimer(); };
  const closeSol = () => { setShowSol(false); if (!solved) startTimer(); };

  const explanation =
    algorithm === "astar"
      ? "Chooses lowest f = g + h using Manhattan; optimal with fewer expansions."
      : algorithm === "bfs"
      ? "Expands states by depth; guaranteed shortest path but more expansions."
      : "Explores one branch deeply; path may be longer. We cap depth for responsiveness.";

  return (
    <main className="h-[100dvh] overflow-hidden grid place-items-center">
      <div className="w-full -mt-3 md:-mt-5">
        <StatusBar {...{ timerLabel, algorithmLabel, distance, solved }} />

        <div className="board-wrap mx-auto" style={{ width: "fit-content" }}>
          <div ref={boardAnchorRef} className="relative mx-auto" style={{ width: "var(--board-size)" }}>
            <ImageUpload
              setTileImages={setTileImages}
              setBoard={setBoard}
              resetTimer={resetTimer}
              onShuffle={async () => {
                clearInterval(playIntRef.current);
                setPlaying(false);
                setSolutionMoves([]);
                setPathStates(null);
                setStepIdx(0);
                snapshotRef.current = null;
                setShowSol(false);
                lastSolvedKeyRef.current = null;
                setSolError(null);
                await shuffle();
                startTimer();
              }}
            />

            <Board board={board} tileImages={tileImages} />

            <button
              type="button"
              className={`absolute right-4 -bottom-1 z-30 px-4 h-[clamp(36px,6vmin,48px)] rounded-btn
                          ${coach ? "bg-green-50" : "bg-white hover:bg-gray-50"} text-text border-0
                          shadow-even transition font-sans font-medium tracking-tight`}
              onClick={() => setCoach(v => !v)}
              aria-pressed={coach}
              title="Toggle coach guidance"
            >
              {coach ? "Coach: ON" : "Coach: OFF"}
            </button>

            {coach && (
              <div className="absolute right-4 bottom-12 text-[11px] text-black/60 z-30">
                {algorithm === "astar" && "A*: hints lower Manhattan (heuristic-guided)"}
                {algorithm === "bfs"   && "BFS: even exploration (layer-by-layer)"}
                {algorithm === "dfs"   && "DFS: follows a fixed deep order (capped)"}
              </div>
            )}

            <ArrowPad
              anchorRef={boardAnchorRef}
              coach={coach}
              arrowEval={arrowEval}
              hintDir={hintDir}
              pressedDir={pressedDir}
              onMove={(dir) => { move(dir); flashArrow(dir); }}
              disabled={playing}
              positionOptions={{ anchor: "right", vOffset: 12, gutter: 12 }}
            />
          </div>
        </div>

        <button
          ref={algBtnRef}
          type="button"
          className="fixed z-30 w-[clamp(44px,7vmin,64px)] h-[clamp(44px,7vmin,64px)]
                     rounded-full grid place-items-center cursor-pointer bg-white text-text
                     shadow-top-left hover:-translate-y-0.5 hover:scale-[1.03] transition
                     left-[clamp(10px,2vmin,18px)] top-[clamp(10px,2vmin,18px)]
                     font-sans font-medium tracking-tight border-0"
          aria-label="Algorithm switcher"
          title="Algorithm"
          onClick={toggleAlg}
        >
          ⚙️
        </button>

        <button
          type="button"
          className="fixed z-30 w-[clamp(44px,7vmin,64px)] h-[clamp(44px,7vmin,64px)]
                     rounded-full grid place-items-center cursor-pointer bg-white text-text
                     shadow-bottom-left hover:-translate-y-0.5 hover:scale-[1.03] transition
                     left-[clamp(12px,2.4vmin,22px)] bottom-[clamp(12px,2.4vmin,22px)]
                     font-sans font-medium tracking-tight border-0"
          aria-label="Show solution"
          title="Solution"
          onClick={toggleSol}
        >
          💡
        </button>

        <AlgorithmDropdown
          open={showAlg}
          anchorRef={algBtnRef}
          value={algorithm}
          onChange={setAlgorithm}
          onClose={closeAlg}
        />

        <SolutionPanel
          open={showSol}
          anchorRef={boardAnchorRef}
          side="left"
          width={360}
          gap={16}
          algorithmLabel={algorithmLabel}
          solutionMoves={solutionMoves}
          stepIdx={stepIdx}
          playing={playing}
          loading={solLoading}
          error={solError}
          onPrev={onPrev}
          onNext={onNext}
          onPlayPause={onPlayPause}
          onResetSteps={onResetSteps}
          onClose={closeSol}
          nodesExpanded={nodesExpanded}
          solveMs={solveMs}
          capBadge={capBadge}
          explanation={explanation}
        />
      </div>
    </main>
  );
}
