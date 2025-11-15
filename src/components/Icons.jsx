// components/Icons.jsx
import React from "react";

export function ArrowIcon({ dir, className = "w-2 h-2 opacity-70", title }) {
  const paths = {
    up:    "M12 5 L12 19 M12 5 L7 10 M12 5 L17 10",
    down:  "M12 5 L12 19 M12 19 L7 14 M12 19 L17 14",
    left:  "M5 12 L19 12 M5 12 L10 7 M5 12 L10 17",
    right: "M5 12 L19 12 M19 12 L14 7 M19 12 L14 17",
  };
  const d = paths[dir] || ""; // safe fallback
  const aria = title ? { role: "img" } : { "aria-hidden": "true", focusable: "false" };

  return (
    <svg viewBox="0 0 24 24" className={className} {...aria}>
      {title ? <title>{title}</title> : null}
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const MoveIcons = {
  up: <ArrowIcon dir="up" />,
  down: <ArrowIcon dir="down" />,
  left: <ArrowIcon dir="left" />,
  right: <ArrowIcon dir="right" />,
};
