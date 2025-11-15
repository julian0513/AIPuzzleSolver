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
import AlgorithmModal from "./components/AlgorithmModal.jsx";
import SolutionModal from "./components/SolutionModal.jsx";

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
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const snapshotRef = useRef(null);
  const playIntRef = useRef(null);

  useKeyboardControls({
    disabled: showAlg || showSol || playing,
    onMove: (dir) => { move(dir); flashArrow(dir); },
    onFlash: flashArrow,
    preventScroll: true,
  });

  useEffect(() => { makeFloatingShapes(); }, []);
  useEffect(() => { if (solved) fireConfetti(); }, [solved]);

  useEffect(() => {
    if (!showSol) return;
    (async () => {
      snapshotRef.current = [...board];
      setPlaying(false);
      setStepIdx(0);
      try {
        const data = await solveRemote(snapshotRef.current, algorithm, false);
        setSolutionMoves(Array.isArray(data.moves) ? data.moves : []);
        stopTimer();
      } catch {
        setSolutionMoves([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSol]);

  const onPrev = () => {
    if (!snapshotRef.current || stepIdx === 0) return;
    let s = [...snapshotRef.current];
    for (let i = 0; i < stepIdx - 1; i++) s = applyMoveCode(solutionMoves[i], s);
    setBoard(s);
    setStepIdx(stepIdx - 1);
  };

  const onNext = () => {
    if (!snapshotRef.current || stepIdx >= solutionMoves.length) return;
    setBoard(prev => applyMoveCode(solutionMoves[stepIdx], prev));
    setStepIdx(stepIdx + 1);
  };

  const onResetSteps = () => {
    if (!snapshotRef.current) return;
    setBoard([...snapshotRef.current]);
    setStepIdx(0);
    setPlaying(false);
  };

  const onPlayPause = () => {
    if (!snapshotRef.current) return;
    if (playing) {
      clearInterval(playIntRef.current);
      setPlaying(false);
      return;
    }
    setPlaying(true);
    if (stepIdx === 0) setBoard([...snapshotRef.current]);
    playIntRef.current = setInterval(() => {
      setStepIdx((s) => {
        if (s >= solutionMoves.length) {
          clearInterval(playIntRef.current);
          setPlaying(false);
          return s;
        }
        setBoard(prev => applyMoveCode(solutionMoves[s], prev));
        return s + 1;
      });
    }, 450);
  };

  const closeModals = () => {
    setShowAlg(false);
    setShowSol(false);
    if (!solved) startTimer();
  };

  return (
<main className="h-[100dvh] overflow-hidden grid place-items-center">
      <div className="w-full">
        <StatusBar {...{ timerLabel, algorithmLabel, distance, solved }} />

        <div className="board-wrap mx-auto" style={{ width: "fit-content" }}>
          {/* Board container must be relative for absolute-positioned children */}
          <div className="relative mx-auto" style={{ width: "var(--board-size)" }}>
            {/* Upload + Shuffle stack (Shuffle lives directly under Upload now) */}
            <ImageUpload
              setTileImages={setTileImages}
              setBoard={setBoard}
              resetTimer={resetTimer}
              onShuffle={shuffle}
            />

            {/* Main 3×3 board */}
            <Board board={board} tileImages={tileImages} />

            {/* Coach — moved slightly left and down */}
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
          </div>
        </div>

        {/* Algorithm (top-left) */}
        <button
          type="button"
          className="fixed z-30 w-[clamp(44px,7vmin,64px)] h-[clamp(44px,7vmin,64px)]
                     rounded-full grid place-items-center cursor-pointer bg-white text-text
                     shadow-top-left hover:-translate-y-0.5 hover:scale-[1.03] transition
                     left-[clamp(10px,2vmin,18px)] top-[clamp(10px,2vmin,18px)]
                     font-sans font-medium tracking-tight border-0"
          aria-label="Algorithm switcher"
          title="Algorithm"
          onClick={() => { setShowAlg(true); stopTimer(); }}
        >
          ⚙️
        </button>

        {/* Solution (bottom-left) */}
        <button
          type="button"
          className="fixed z-30 w-[clamp(44px,7vmin,64px)] h-[clamp(44px,7vmin,64px)]
                     rounded-full grid place-items-center cursor-pointer bg-white text-text
                     shadow-bottom-left hover:-translate-y-0.5 hover:scale-[1.03] transition
                     left-[clamp(12px,2.4vmin,22px)] bottom-[clamp(12px,2.4vmin,22px)]
                     font-sans font-medium tracking-tight border-0"
          aria-label="Show solution"
          title="Solution"
          onClick={() => { setShowSol(true); stopTimer(); }}
        >
          💡
        </button>

        <ArrowPad
        className="bottom-2 right-2"
          coach={coach}
          arrowEval={arrowEval}
          hintDir={hintDir}
          pressedDir={pressedDir}
          onMove={(dir) => { move(dir); flashArrow(dir); }}
          disabled={showAlg || showSol || playing}
        />

        {/* Modals */}
        <AlgorithmModal
          show={showAlg}
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          onClose={closeModals}
        />

        <SolutionModal
          show={showSol}
          algorithmLabel={algorithmLabel}
          solutionMoves={solutionMoves}
          stepIdx={stepIdx}
          playing={playing}
          onPrev={onPrev}
          onNext={onNext}
          onPlayPause={onPlayPause}
          onResetSteps={onResetSteps}
          onClose={closeModals}
        />
      </div>
    </main>
  );
}
