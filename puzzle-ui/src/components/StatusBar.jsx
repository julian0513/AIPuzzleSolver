import React from "react";

export default function StatusBar({ timerLabel, algorithmLabel = "A*", distance, solved }) {
  const distLabel = typeof distance === "number" ? String(distance) : "…";

  return (
    <div className="w-full flex justify-center">
      <div
        className="status-hover inline-flex items-center gap-[.5rem] mb-[clamp(10px,1.8vmin,16px)] select-none font-medium tracking-tight"
        role="status"
        aria-live="polite"
      >
        <span className="text-black">
          Timer: <b className="text-gray-600"><time>{timerLabel}</time></b>
        </span>

        <span className="text-black/30 mx-3" aria-hidden="true">|</span>

        <span className="text-black">
          Algorithm: <b className="text-gray-600">{algorithmLabel}</b>
        </span>

        <span className="text-black/30 mx-3" aria-hidden="true">|</span>

        <span className="text-black">
          Distance: <b className="text-gray-600">{distLabel}</b>
        </span>

        <span className="text-black/30 mx-3" aria-hidden="true">|</span>

        <span className="text-black">
          Solved: <b className="text-gray-600">{solved ? "Yes" : "No"}</b>
        </span>
      </div>
    </div>
  );
}
