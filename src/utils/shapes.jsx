// utils/shapes.jsx
function seededRand(seed) {
  // xorshift32
  let x = seed || (Math.random() * 1e9) | 0;
  return () =>
    ((x ^= x << 13), (x ^= x >>> 17), (x ^= x << 5), (x >>> 0) / 2 ** 32);
}

export function makeFloatingShapes({
  count = 15,
  hueBase = 130,          // light blue-ish start
  hueJitter = 20,
  speedRange = [8, 14],   // seconds
  driftRange = [-30, 30], // vw/vh
  seed,                   // optional: deterministic layout
  ensureHost = true,      // create #bg-shapes if missing
} = {}) {
  // SSR & reduced-motion guards
  if (typeof window === "undefined" || typeof document === "undefined") return () => {};
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return () => {};

  let container = document.getElementById("bg-shapes");
  if (!container && ensureHost) {
    container = document.createElement("div");
    container.id = "bg-shapes";
    // fallback styling if CSS not present
    Object.assign(container.style, {
      position: "fixed",
      inset: 0,
      pointerEvents: "none",
      zIndex: 0,
    });
    document.body.appendChild(container);
  }
  if (!container) return () => {};

  // idempotent: clear previous shapes
  container.innerHTML = "";

  const rand = seed != null ? seededRand(seed) : Math.random;
  const shapes = ["circle", "square", "triangle", "hexagon", "pentagon"];

  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    const shapeType = shapes[(rand() * shapes.length) | 0];
    const sizeClass = "size" + (1 + ((rand() * 3) | 0));
    el.classList.add("shape", shapeType, sizeClass);

    // start position
    el.style.top = (rand() * 100).toFixed(2) + "vh";
    el.style.left = (rand() * 100).toFixed(2) + "vw";

    // light blue conic gradient (matches original)
    const h = hueBase + Math.floor(rand() * hueJitter);
    el.style.background = `conic-gradient(
      from ${Math.floor(rand() * 360)}deg,
      hsla(${h}, 95%, 72%, .35),
      hsla(${h + 8}, 85%, 64%, .32),
      hsla(${h + 16}, 80%, 58%, .28),
      hsla(${h + 24}, 75%, 55%, .25),
      hsla(${h + 32}, 70%, 52%, .22),
      hsla(${h + 40}, 65%, 50%, .20),
      hsla(${h + 48}, 60%, 48%, .18)
    )`;

    // drift + speed
    const tx =
      (rand() * (driftRange[1] - driftRange[0]) + driftRange[0]).toFixed(1) +
      "vw";
    const ty =
      (rand() * (driftRange[1] - driftRange[0]) + driftRange[0]).toFixed(1) +
      "vh";
    const dur =
      (speedRange[0] + rand() * (speedRange[1] - speedRange[0])).toFixed(1) +
      "s";
    el.style.setProperty("--tx", tx);
    el.style.setProperty("--ty", ty);
    el.style.setProperty("--dur", dur);

    frag.appendChild(el);
  }
  container.appendChild(frag);

  // cleanup
  return function clearFloatingShapes() {
    if (container) container.innerHTML = "";
  };
}

// convenience explicit clear
export function clearFloatingShapes() {
  if (typeof document === "undefined") return;
  const container = document.getElementById("bg-shapes");
  if (container) container.innerHTML = "";
}
