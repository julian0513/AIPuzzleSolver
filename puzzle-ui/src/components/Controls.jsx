// components/Controls.jsx
import React from "react";

export default function Controls({
  onOpenSteps,
  coach,
  onToggleCoach,
  disabled = false,
}) {
  return (
    <div role="toolbar" aria-label="Puzzle controls" className="flex gap-4 justify-center mt-3">
      <button
        type="button"
        className="px-4 h-[clamp(36px,6vmin,48px)] rounded-btn bg-white text-text border border-black/10 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => !disabled && onOpenSteps?.()}
        disabled={disabled}
        title="Show optimal steps"
      >
        Solution
      </button>

      <button
        type="button"
        className={`px-4 h-[clamp(36px,6vmin,48px)] rounded-btn border border-black/10 ${
          coach ? "bg-green-50 text-text" : "bg-white text-text hover:bg-gray-50"
        }`}
        onClick={() => !disabled && onToggleCoach?.()}
        aria-pressed={coach}
        disabled={disabled}
        title="Toggle coach guidance"
      >
        {coach ? "Coach: ON" : "Coach: OFF"}
      </button>
    </div>
  );
}
