// Floating Ciallo text effect — zero DOM on idle, Web Animations API driven
const VARIANTS = ["Ciallo～(∠・ω< )⌒★", "Ciallo～(∠・ω< )⌒☆"];
let variantIdx = 0;
const THROTTLE_MS = 300; // ms between spawns — prevents keyboard repeat / rapid-click spam
let lastSpawn = 0;

const FONTS = [
  '"ciallo-kuaile", var(--font-app), cursive',
  '"ciallo-qingke", var(--font-app), sans-serif',
  "var(--font-app)",
];

function getTheme(): "dark" | "light" {
  const t = document.documentElement.dataset.theme;
  if (t === "dark" || t === "light") return t;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function randomThemeColor(): string {
  const isDark = getTheme() === "dark";
  const h = Math.floor(Math.random() * 360);
  const s = isDark ? 80 : 60;
  const l = isDark ? 70 : 50;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function spawnFloatingCiallo(x?: number, y?: number): boolean {
  const now = Date.now();
  if (now - lastSpawn < THROTTLE_MS) return false;
  lastSpawn = now;
  if (x === undefined || y === undefined) {
    const mX = 80;
    const mY = 60;
    x = mX + Math.random() * (window.innerWidth - mX * 2);
    y = mY + Math.random() * (window.innerHeight - mY - 120);
  }
  variantIdx = (variantIdx + 1) % VARIANTS.length;
  const el = document.createElement("span");
  el.textContent = VARIANTS[variantIdx];
  el.style.cssText = [
    "position: fixed",
    "z-index: 99999",
    `left: ${x}px`,
    "translate: -50% 0",
    `top: ${y - 20}px`,
    `font-family: ${FONTS[Math.floor(Math.random() * FONTS.length)]}`,
    `font-weight: ${[400, 700, 900][Math.floor(Math.random() * 3)]}`,
    `color: ${randomThemeColor()}`,
    "pointer-events: none",
    "user-select: none",
    "white-space: nowrap",
    "will-change: transform, opacity",
  ].join(";");

  document.body.appendChild(el);
  el.animate(
    [
      { transform: "translateY(0)", opacity: 1 },
      { transform: "translateY(-180px)", opacity: 0 },
    ],
    { duration: 2500, easing: "ease-out", fill: "forwards" },
  ).finished.then(() => el.remove());
  return true;
}
