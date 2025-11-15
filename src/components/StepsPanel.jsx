import React, { useId } from "react";


export default function StepsPanel({
  algorithmLabel,
  solutionMoves = [],
  stepIdx = 0,
  playing = false,
  trace = [],
  nodesExpanded,
  solveMs,
  onPrev,
  onNext,
  onPlayPause,
  onResetSteps,
  onClose,
  onJumpTo,
}) {
  const titleId = useId();
  const total = solutionMoves.length;
  const atStart = stepIdx <= 0;
  const atEnd = stepIdx >= total;

  const onKeys = (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); if (!atStart) onPrev?.(); }
    if (e.key === "ArrowRight") { e.preventDefault(); if (!atEnd) onNext?.(); }
    if (e.key === " ") { e.preventDefault(); onPlayPause?.(); }
    if (e.key === "Home") { e.preventDefault(); onResetSteps?.(); }
  };

  return (
    <div className="solution-panel" onKeyDown={onKeys}>
      <h4 id={titleId}>Solution • {algorithmLabel}</h4>

      <div className="text-sm text-muted mb-2" aria-describedby={titleId}>
        {nodesExpanded != null && (
          <span>
            Nodes: <b className="text-text">{nodesExpanded}</b>{solveMs != null ? " • " : ""}
          </span>
        )}
        {solveMs != null && (
          <span>
            Time: <b className="text-text">{solveMs} ms</b>
          </span>
        )}
      </div>

      {/* Mini-viz of f = g + h over the path (trace[0] = start state) */}
      <div className="viz" aria-label="Cost profile over path">
        {trace.map((t, i) => (
          <div
            key={i}
            className={i === stepIdx ? "active" : ""}
            style={{ flex: Math.max(1, t.f || 1) }}
            title={`Step ${i}: g=${t.g ?? "?"}, h=${t.h ?? "?"}, f=${t.f ?? "?"}`}
            onClick={() => onJumpTo?.(i)}        // clicking bar jumps to that stepIdx
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") onJumpTo?.(i); }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mb-2" role="group" aria-label="Playback controls">
        <button
          type="button"
          className="px-3 py-2 rounded-btn bg-panel2 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onPrev}
          disabled={atStart}
          title="Prev (←)"
        >Prev</button>

        <button
          type="button"
          className="px-3 py-2 rounded-btn bg-panel2 border border-white/10"
          onClick={onPlayPause}
          aria-pressed={playing}
          title="Play/Pause (Space)"
        >{playing ? "Pause" : "Play"}</button>

        <button
          type="button"
          className="px-3 py-2 rounded-btn bg-panel2 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onNext}
          disabled={atEnd}
          title="Next (→)"
        >Next</button>

        <button
          type="button"
          className="px-3 py-2 rounded-btn bg-panel2 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onResetSteps}
          disabled={total === 0}
          title="Reset (Home)"
        >Reset</button>

        <div className="ml-auto text-sm text-muted" aria-live="polite">
          Step {Math.min(stepIdx, total)}/{total}
        </div>
      </div>

      {/* Steps list */}
      <div className="steps-list" role="list" aria-label="Solution steps">
        {total === 0 && <div className="text-sm text-muted">No solution data.</div>}
{solutionMoves.map((m, i) => (
  <div
    key={i}
    className={`step-item ${i === stepIdx ? "active" : ""}`}
    role="listitem"
    aria-current={i === stepIdx ? "step" : undefined}
    tabIndex={0}
    onClick={() => onJumpTo && onJumpTo(i)}
    onKeyDown={(e) => { if (e.key === "Enter" && onJumpTo) onJumpTo(i); }}
    title={`Move ${i + 1}: ${m}`}
  >
    <div className="w-6 h-6 grid place-items-center rounded bg-panel2 text-text border border-white/10">
      {m}
    </div>
    <div className="text-sm text-text">
      g={trace[i + 1]?.g ?? i + 1} • h={trace[i + 1]?.h ?? "—"} • f={trace[i + 1]?.f ?? "—"}
    </div>
  </div>
))}

      </div>

      <div className="mt-3">
        <button
          type="button"
          className="px-3 py-2 rounded-btn bg-panel2 border border-white/10"
          onClick={onClose}
        >Close</button>
      </div>
    </div>
  );
}
