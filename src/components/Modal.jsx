import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  show,
  onClose,
  children,
  width = "min(92vw,520px)",
  // accessibility
  ariaLabel,
  ariaLabelledBy,
  // behavior
  closeOnOverlay = true,
  initialFocusRef,
}) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!show) return;
    previouslyFocused.current = document.activeElement;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const toFocus =
      initialFocusRef?.current ||
      panelRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) ||
      panelRef.current;
    toFocus?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
      }
      if (e.key === "Tab") {
        const focusables = panelRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;

        const list = Array.from(focusables);
        const first = list[0];
        const last = list[list.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = originalOverflow;
      previouslyFocused.current && previouslyFocused.current.focus?.();
    };
  }, [show, onClose, initialFocusRef]);

  if (!show) return null;

  const overlay = (
    <div
      className="overlay show"
      role="dialog"
      aria-modal="true"
      {...(ariaLabel ? { "aria-label": ariaLabel } : {})}
      {...(ariaLabelledBy ? { "aria-labelledby": ariaLabelledBy } : {})}
      onPointerDown={(e) => {
        if (closeOnOverlay && e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        className="bg-white/60 backdrop-blur-xl rounded-[20px] p-6 shadow-[0_16px_48px_rgba(0,0,0,.10)] outline-none"
        style={{ width }}
        // Prevent overlay close when clicking inside the panel
        onPointerDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
