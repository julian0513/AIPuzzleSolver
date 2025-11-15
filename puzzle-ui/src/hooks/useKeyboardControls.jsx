import { useEffect } from "react";

const isTypingField = (el) => {
  const tag = el?.tagName?.toLowerCase();
  return tag === "input" || tag === "textarea" || el?.isContentEditable;
};

/**
 * Keyboard bindings for moving tiles.
 * - Preserves original behavior (Arrow/WASD, prevents scroll).
 * - Adds SSR safety and optional guards for modifiers/repeat.
 */
export default function useKeyboardControls({
  disabled = false,
  onMove,
  onFlash,
  map = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    w: "up", s: "down", a: "left", d: "right",
  },
  allowInInputs = false,
  preventScroll = true,
  ignoreModifiers = true,  // NEW: skip when Ctrl/Meta/Alt held (defaults to true)
  ignoreRepeat = false,    // NEW: skip key auto-repeat if desired (defaults to false for parity)
  target,                  // if omitted, resolves to window in-effect (SSR-safe)
} = {}) {
  useEffect(() => {
    if (disabled || !onMove) return;

    const tgt = target ?? (typeof window !== "undefined" ? window : undefined);
    if (!tgt) return;

    const handler = (e) => {
      if (!allowInInputs && isTypingField(e.target)) return;
      if (ignoreModifiers && (e.metaKey || e.ctrlKey || e.altKey)) return;
      if (ignoreRepeat && e.repeat) return;

      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; // "w" or "ArrowUp"
      const dir = map[k] || map[e.code]; // also allows "KeyW"
      if (!dir) return;

      if (preventScroll) e.preventDefault();
      onMove(dir);
      onFlash?.(dir);
    };

    // capture:true to run before page scroll handlers
    tgt.addEventListener("keydown", handler, { capture: true });
    return () => tgt.removeEventListener("keydown", handler, { capture: true });
    // Keep `map` stable (wrap in useMemo upstream) to avoid re-binding.
  }, [
    disabled,
    onMove,
    onFlash,
    allowInInputs,
    preventScroll,
    ignoreModifiers,
    ignoreRepeat,
    target,
    map,
  ]);
}
