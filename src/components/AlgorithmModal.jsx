import React, { useEffect, useId, useRef } from "react";
import Modal from "./Modal.jsx";

const OPTIONS = [
  { key: "astar", title: "A*",  desc: "Optimal, heuristic-guided" },
  { key: "bfs",   title: "BFS",  desc: "Optimal, no heuristic" },
  { key: "dfs",   title: "DFS",  desc: "Not guaranteed optimal" },
];

export default function AlgorithmModal({ show, algorithm, setAlgorithm, onClose }) {
  const titleId = useId();
  const groupRef = useRef(null);
  const idx = Math.max(0, OPTIONS.findIndex(o => o.key === algorithm));

  // Focus selected option on open (roving tabindex)
  useEffect(() => {
    if (!show) return;
    const targetKey = OPTIONS[idx]?.key ?? OPTIONS[0].key;
    groupRef.current?.querySelector(`[data-key="${targetKey}"]`)?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, idx]);

  const onArrow = (e) => {
    if (!["ArrowUp","ArrowLeft","ArrowDown","ArrowRight","Home","End"].includes(e.key)) return;
    e.preventDefault();
    let next = idx;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft")   next = (idx - 1 + OPTIONS.length) % OPTIONS.length;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (idx + 1) % OPTIONS.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End")  next = OPTIONS.length - 1;
    const nextKey = OPTIONS[next].key;
    setAlgorithm(nextKey);
    groupRef.current?.querySelector(`[data-key="${nextKey}"]`)?.focus();
  };

  return (
<Modal show={show} onClose={onClose} ariaLabelledBy={titleId}>
      <h3 id={titleId} className="m-0 mb-3 text-[clamp(18px,2vmin,20px)]">Choose Algorithm</h3>

      <div
        ref={groupRef}
        role="radiogroup"
        aria-labelledby={titleId}
        className="flex flex-col gap-2"
        onKeyDown={onArrow}
      >
        {OPTIONS.map(opt => {
          const selected = algorithm === opt.key;
          return (
            <button
              key={opt.key}
              data-key={opt.key}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
  className={`flex items-center justify-between px-4 py-3 rounded-[14px] bg-white
              ${selected
                ? "ring-2 ring-blue-500/20 shadow-[0_8px_24px_rgba(0,0,0,.08)]"
                : "hover:bg-gray-50"
              }`}
  onClick={() => setAlgorithm(opt.key)}
>
  <span className="flex items-center gap-3 text-text">
    <b className="text-[15px]">{opt.title}</b>
    <span className="text-muted text-sm">{opt.desc}</span>
  </span>
  <span className="text-blue-600">{selected ? "✔" : ""}</span>
</button>

          );
        })}
      </div>

      <div className="flex gap-2 items-center mt-3">
        <button
          type="button"
          className="px-4 h-[clamp(38px,6vmin,54px)] rounded-btn bg-panel2 text-text border border-white/10 hover:-translate-y-0.5 hover:scale-[1.02] transition"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
