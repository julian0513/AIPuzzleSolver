// components/ArrowPad.jsx
import React, { forwardRef, memo } from "react";
import { MoveIcons } from "./Icons.jsx";

const DIRS = ["up", "left", "right", "down"]; // matches .arrow-pad grid areas

// Centralize spacing from the board here:
const OFFSET_RIGHT = 16;  // px to push the pad to the RIGHT of the board
const OFFSET_BOTTOM = 12; // px above the board's bottom edge

const ArrowPad = memo(
  forwardRef(function ArrowPad(
    { coach, arrowEval = {}, hintDir, pressedDir, onMove, disabled = false, className = "" },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={`absolute z-30 arrow-pad ${className}`}
        style={{ left: "100%", bottom: `${OFFSET_BOTTOM}px`, marginLeft: `${OFFSET_RIGHT}px` }}
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
