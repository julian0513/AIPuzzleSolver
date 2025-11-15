import { useLayoutEffect } from "react";

export default function useArrowPadPosition(
  boardRef,
  padRef,
  { gutter = 180, anchor = "right", vAlign = "bottom", vOffset = 12, clamp = true, observe = [] } = {}
) {
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const boardEl = boardRef?.current;
    const padEl = padRef?.current;
    if (!boardEl || !padEl) return;

    let rafId;
    const position = () => {
      const b = boardEl.getBoundingClientRect();
      const padRect = padEl.getBoundingClientRect();

      // horizontal position (default to right of board, nudged by gutter)
      let left =
        anchor === "left"
          ? b.left - gutter - padRect.width
          : b.right - padRect.width + gutter;

      if (clamp) {
        left = Math.max(8, Math.min(left, window.innerWidth - padRect.width - 8));
      }

      // write styles
      padEl.style.left = Math.round(left) + "px";
      padEl.style.right = "auto";

      if (vAlign === "top") {
        let top = b.top + vOffset;
        if (clamp) {
          top = Math.max(8, Math.min(top, window.innerHeight - padRect.height - 8));
        }
        padEl.style.top = Math.round(top) + "px";
        padEl.style.bottom = "auto";
      } else {
        // match original: pin to bottom gutter
        padEl.style.top = "auto";
        padEl.style.bottom = vOffset + "px";
      }
    };

    const schedule = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(position);
    };

    // initial + events
    schedule();
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("orientationchange", schedule, { passive: true });

    // react to element size changes
    const ro = new ResizeObserver(schedule);
    ro.observe(boardEl);
    ro.observe(padEl);

    return () => {
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("orientationchange", schedule);
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardRef, padRef, gutter, anchor, vAlign, vOffset, clamp, ...observe]);
}
