import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function SolutionPanel({
  open,
  anchorRef,
  side = "left",
  width = 360,
  gap = 16,
  algorithmLabel = "",
  solutionMoves = [],
  stepIdx = 0,
  playing = false,
  loading = false,
  error = null,
  onPrev,
  onNext,
  onPlayPause,
  onResetSteps,
  onClose,
  nodesExpanded,
  solveMs,
  capBadge,
  explanation,
}) {
  const panelRef = useRef(null);
  const [pos, setPos] = useState({ left: 0, top: 12, bottom: 12 });

  useLayoutEffect(() => {
    if (!open) return;
    const anchor = anchorRef?.current;
    if (!anchor) return;
    const b = anchor.getBoundingClientRect();
    const pad = 12;
    let left = side === "left" ? (b.left - width - gap) : (b.right + gap);
    left = Math.max(pad, Math.min(left, window.innerWidth - width - pad));
    setPos({ left: Math.round(left), top: pad, bottom: pad });
  }, [open, anchorRef, side, width, gap]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  if (!open) return null;

  const total = solutionMoves.length;
  const atStart = stepIdx <= 0;
  const atEnd = stepIdx >= total;
  const disabled = loading || !total;

  return (
    <aside
      ref={panelRef}
      className="fixed z-40 rounded-[16px]
                 bg-white/90 backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,.18)]
                 border border-black/10 p-4 flex flex-col"
      style={{ left: pos.left, top: pos.top, bottom: pos.bottom, width }}
      aria-label="Solution panel"
    >
      <div className="flex items-start gap-2">
        <div className="text-sm text-black/70">
          <div><b>Algorithm:</b> {algorithmLabel}</div>
          <div><b>Steps:</b> {loading ? "…" : total}</div>
          {typeof nodesExpanded === "number" && <div><b>Nodes:</b> {nodesExpanded}</div>}
          {typeof solveMs === "number" && <div><b>Time:</b> {solveMs} ms</div>}
          {capBadge && <div className="text-xs text-amber-700 bg-amber-100 rounded px-1 mt-1">{capBadge}</div>}
        </div>
        <button
          type="button"
          className="ml-auto px-3 h-8 rounded-btn bg-white border border-black/10 hover:bg-gray-50"
          onClick={onClose}
          title="Close"
        >✕</button>
      </div>

      {explanation && <p className="text-xs text-black/65 mt-2">{explanation}</p>}

      {error && !loading && !total && (
        <div className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">
          {error}
        </div>
      )}

      <div className="mt-2 flex items-center gap-2" role="group" aria-label="Playback">
        <button className="px-3 h-9 rounded-btn bg-white border border-black/10 disabled:opacity-50"
                onClick={onPrev} disabled={disabled || atStart} title="Prev">Prev</button>
        <button className="px-3 h-9 rounded-btn bg-white border border-black/10 disabled:opacity-50"
                onClick={onPlayPause} disabled={disabled} aria-pressed={playing} title="Play/Pause">
          {playing ? "Pause" : (loading ? "Loading…" : "Play")}
        </button>
        <button className="px-3 h-9 rounded-btn bg-white border border-black/10 disabled:opacity-50"
                onClick={onNext} disabled={disabled || atEnd} title="Next">Next</button>
        <button className="px-3 h-9 rounded-btn bg-white border border-black/10 disabled:opacity-50"
                onClick={onResetSteps} disabled={disabled} title="Reset">Reset</button>
        <span className="text-xs text-black/60 ml-1">Step {Math.min(stepIdx, total)}/{total || 0}</span>
      </div>

      <div className="h-1 bg-black/10 rounded mt-2" aria-hidden="true">
        <div className="h-full bg-black/25"
             style={{ width: total ? `${(Math.min(stepIdx, total) / total) * 100}%` : "0%" }} />
      </div>

      <div className="mt-3 text-xs text-black/55">
        Press <b>Esc</b> to close. Arrow keys still move the board.
      </div>
    </aside>
  );
}
