// Floating Ciallo text effect — zero DOM on idle, Web Animations API driven

const VARIANTS = ["Ciallo～(∠・ω< )⌒★", "Ciallo～(∠・ω< )⌒☆"];
let variantIdx = 0;

function randomHex(): string {
  return (
    "#" +
    Math.floor(Math.random() * 0x1000000)
      .toString(16)
      .padStart(6, "0")
  );
}

export function spawnFloatingCiallo(x: number, y: number): void {
  variantIdx = (variantIdx + 1) % VARIANTS.length;
  const el = document.createElement("span");
  el.textContent = VARIANTS[variantIdx];
  el.style.cssText = [
    "position: fixed",
    "z-index: 99999",
    `left: ${x}px`,
    `top: ${y - 20}px`,
    "font-weight: bold",
    `color: ${randomHex()}`,
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
}
