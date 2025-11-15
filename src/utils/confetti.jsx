// utils/confetti.jsx
export function fireConfetti({
  count = 120,
  hueRange = [200, 230],  // light blue range
  decay = 0.992,
  gravity = 0.12,
  drift = 0.5,
  // rely on .confetti-canvas z-index from CSS (50); override here only if you want
  zIndex,                 // undefined = use CSS
  duration = 3000,        // ms safeguard
} = {}) {
  if (typeof window === "undefined") return () => {};
  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (prefersReduced) return () => {};

  const canvas = document.createElement("canvas");
  canvas.className = "confetti-canvas";
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    ...(zIndex != null ? { zIndex: String(zIndex) } : {}),
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const state = { raf: 0, parts: [], alive: true, start: performance.now() };

  const resize = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    canvas.width = Math.max(1, Math.floor(W * dpr));
    canvas.height = Math.max(1, Math.floor(H * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // CSS pixels
  };
  resize();
  window.addEventListener("resize", resize, { passive: true });

  const { width: Wpx, height: Hpx } = canvas.getBoundingClientRect();
  const rand = (a, b) => a + Math.random() * (b - a);
  state.parts = Array.from({ length: count }, () => ({
    x: rand(0, Wpx),
    y: rand(-40, -10),
    vx: rand(-drift, drift) * 8,
    vy: rand(2, 5),
    r: rand(3, 7),
    a: 0.9,
    s: 0, // spin
    hue: rand(hueRange[0], hueRange[1]),
  }));

  const stop = () => {
    if (!state.alive) return;
    state.alive = false;
    cancelAnimationFrame(state.raf);
    window.removeEventListener("resize", resize);
    canvas.remove();
  };

  const tick = (t) => {
    if (!state.alive) return;
    const dt = Math.min(2, (t - (state.t0 ?? t)) / 16);
    state.t0 = t;

    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    for (const p of state.parts) {
      p.vy += gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.s += 0.1 * dt;
      p.a *= decay ** dt;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.s);
      ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${Math.max(0, p.a)})`;
      ctx.fillRect(-p.r, -p.r, 2 * p.r, 2 * p.r);
      ctx.restore();
    }

    const stillVisible = state.parts.some((p) => p.a > 0 && p.y < canvas.clientHeight + 20);
    const timedOut = t - state.start > duration;
    if (stillVisible && !timedOut) state.raf = requestAnimationFrame(tick);
    else stop();
  };

  state.raf = requestAnimationFrame(tick);
  return stop; // caller can cancel early
}
