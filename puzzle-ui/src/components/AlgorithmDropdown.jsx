import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

const OPTIONS = [
  { key: "astar", title: "A*",  desc: "Heuristic-guided, optimal" },
  { key: "bfs",   title: "BFS",  desc: "Layer-by-layer, optimal" },
  { key: "dfs",   title: "DFS",  desc: "Deep dives; non-optimal (capped)" },
];

export default function AlgorithmDropdown({ open, anchorRef, value, onChange, onClose }) {
  const panelRef = useRef(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useLayoutEffect(() => {
    if (!open) return;
    const btn = anchorRef?.current;
    const panel = panelRef?.current;
    if (!btn || !panel) return;

    const rect = btn.getBoundingClientRect();
    const top = rect.bottom + 8;
    const left = rect.right; // anchor at button's right edge
    setPos({ left, top });

    // after first paint, align the panel's RIGHT edge to the button's RIGHT edge
    requestAnimationFrame(() => {
      if (!panelRef.current) return;
      const pw = panelRef.current.offsetWidth;
      let L = left - pw; // bottom-right align
      // clamp to viewport with 8px padding
      L = Math.max(8, Math.min(L, window.innerWidth - pw - 8));
      panelRef.current.style.left = `${Math.round(L)}px`;
    });
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    const onClickAway = (e) => { if (!panelRef.current?.contains(e.target)) onClose?.(); };
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onClickAway, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onClickAway, true);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="fixed z-40 rounded-[14px] bg-white shadow-[0_12px_36px_rgba(0,0,0,.12)] border border-black/10 p-2"
      style={{ left: pos.left, top: pos.top, minWidth: 220 }}
      role="menu"
      aria-label="Choose algorithm"
    >
      {OPTIONS.map(opt => {
        const selected = opt.key === value;
        return (
          <button
            key={opt.key}
            type="button"
            role="menuitemradio"
            aria-checked={selected}
            className={`w-full text-left px-3 py-2 rounded-[10px] flex items-center justify-between
                        ${selected ? "bg-blue-50" : "hover:bg-gray-50"}`}
            onClick={() => { onChange?.(opt.key); onClose?.(); }}
          >
            <span className="flex items-center gap-2">
              <b className="text-sm">{opt.title}</b>
              <span className="text-xs text-black/60">{opt.desc}</span>
            </span>
            <span className="text-blue-600">{selected ? "✔" : ""}</span>
          </button>
        );
      })}
    </div>
  );
}
