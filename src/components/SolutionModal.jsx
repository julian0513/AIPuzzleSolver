import React, { useId } from "react";
import Modal from "./Modal.jsx"; //

export default function SolutionModal({
  show,
  algorithmLabel = "",
  solutionMoves = [],
  stepIdx = 0,
  playing = false,
  onPrev,
  onNext,
  onPlayPause,
  onResetSteps,
  onClose,
}) {
  const titleId = useId();
  const total = solutionMoves.length;
  const atStart = stepIdx <= 0;
  const atEnd = stepIdx >= total;

  const onKey = (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); if (!atStart) onPrev?.(); }
    if (e.key === "ArrowRight") { e.preventDefault(); if (!atEnd) onNext?.(); }
    if (e.key === " ") { e.preventDefault(); onPlayPause?.(); }
    if (e.key === "Home") { e.preventDefault(); onResetSteps?.(); }
  };

  return (
    <Modal show={show} onClose={onClose} ariaLabelledBy={titleId}>
      <h3 id={titleId} className="m-0 mb-3 text-[clamp(18px,2vmin,20px)]">Optimal Solution</h3>

      <p className="text-muted text-sm mb-3">
        Algorithm: <b>{algorithmLabel}</b> • Steps: {total}
      </p>

      <div
        className="flex items-center gap-2 mb-2"
        role="group"
        aria-label="Playback controls"
        onKeyDown={onKey}
      >
        <button
          className="px-4 h-[clamp(38px,6vmin,54px)] rounded-btn bg-panel2 text-text border border-white/10 hover:-translate-y-0.5 hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onPrev}
          disabled={atStart}
          type="button"
          title="Previous step (←)"
        >
          Prev
        </button>

        <button
          className="px-4 h-[clamp(38px,6vmin,54px)] rounded-btn bg-panel2 text-text border border-white/10 hover:-translate-y-0.5 hover:scale-[1.02] transition"
          onClick={onPlayPause}
          aria-pressed={playing}
          type="button"
          title="Play/Pause (Space)"
        >
          {playing ? "Pause" : "Play"}
        </button>

        <button
          className="px-4 h-[clamp(38px,6vmin,54px)] rounded-btn bg-panel2 text-text border border-white/10 hover:-translate-y-0.5 hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onNext}
          disabled={atEnd}
          type="button"
          title="Next step (→)"
        >
          Next
        </button>

        <button
          className="px-4 h-[clamp(38px,6vmin,54px)] rounded-btn bg-panel2 text-text border border-white/10 hover:-translate-y-0.5 hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onResetSteps}
          disabled={total === 0}
          type="button"
          title="Reset to start (Home)"
        >
          Reset
        </button>

        <span className="text-muted text-sm ml-2" aria-live="polite">
          Step {Math.min(stepIdx, total)}/{total}
        </span>

        <div className="flex-1" />

        <button
          className="px-4 h-[clamp(38px,6vmin,54px)] rounded-btn bg-panel2 text-text border border-white/10 hover:-translate-y-0.5 hover:scale-[1.02] transition"
          onClick={onClose}
          type="button"
          title="Close"
        >
          Close
        </button>
      </div>

      {/* tiny progress bar */}
      <div className="h-1 bg-white/10 rounded overflow-hidden" aria-hidden="true">
        <div
          className="h-full bg-white/30"
          style={{ width: total ? `${(Math.min(stepIdx, total) / total) * 100}%` : "0%" }}
        />
      </div>
    </Modal>
  );
}
