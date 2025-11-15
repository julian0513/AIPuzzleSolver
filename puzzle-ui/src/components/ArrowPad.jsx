import React, { forwardRef, memo, useRef } from "react";
import { MoveIcons } from "./Icons.jsx";

function mergeRefs(...refs) {
  return (node) => {
    refs.forEach((r) => {
      if (!r) return;
      if (typeof r === "function") r(node);
      else r.current = node;
    });
  };
}

const DIRS = ["up", "left", "right", "down"];

const ArrowPad = memo(
  forwardRef(function ArrowPad(
    {
      anchorRef,                 // unused with absolute positioning, but kept for API compatibility
      coach,
      arrowEval = {},
      hintDir,
      pressedDir,
      onMove,
      disabled = false,
      className = "",
      positionOptions = {}       // { anchor: "right"|"left", gutter: px, vOffset: px }
    },
    forwardedRef
  ) {
    const padRef = useRef(null);

    const anchor = positionOptions.anchor || "right";
    const gutter = Number.isFinite(positionOptions.gutter) ? positionOptions.gutter : 12;
    const vOffset = Number.isFinite(positionOptions.vOffset) ? positionOptions.vOffset : 12;

    const style =
      anchor === "left"
        ? { position: "absolute", right: "100%", marginRight: `${gutter}px`, bottom: `${vOffset}px` }
        : { position: "absolute", left: "100%",  marginLeft:  `${gutter}px`, bottom: `${vOffset}px` };

    return (
      <div
        ref={mergeRefs(forwardedRef, padRef)}
        className={`z-30 arrow-pad ${className}`}
        style={style}
        aria-label="Direction pad"
      >
        {DIRS.map((dir) => {
          const coachClass = coach
            ? arrowEval[dir] === "good"
              ? "coach-good"
              : arrowEval[dir] === "bad"
              ? "coach-bad"
              : arrowEval[dir] === "ok"
              ? "coach-ok"
              : ""
            : "";

          const flashClass =
            hintDir === dir ? "arrow-press hint-flash" : pressedDir === dir ? "arrow-press" : "";

          return (
            <button
              key={dir}
              type="button"
              className={`w-[clamp(42px,6vmin,58px)] h-[clamp(42px,6vmin,58px)]
                          rounded-[14px] grid place-items-center
                          bg-white text-black shadow-even
                          hover:-translate-y-0.5 hover:scale-[1.03] transition
                          disabled:opacity-50 disabled:cursor-not-allowed
                          font-medium tracking-tight border-0 outline-none
                          ${coachClass} ${flashClass}`}
              style={{ gridArea: dir }}
              onClick={() => onMove?.(dir)}
              disabled={disabled}
              aria-label={`Move ${dir}`}
              title={dir[0].toUpperCase() + dir.slice(1)}
            >
              {MoveIcons[dir]}
            </button>
          );
        })}
      </div>
    );
  })
);

export default ArrowPad;
