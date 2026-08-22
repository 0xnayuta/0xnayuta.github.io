// Canvas dino-runner game rendering with Chrome T-Rex Runner sprite sheet.
// Sprite: Chromium BSD licensed (200-offline-sprite.png)

import spriteUrl from "../assets/images/sprite.png";

const W = 720,
  H = 300;
const GROUND_Y = 277;
const DINO_X = 50;

// physics
const GRAVITY = 0.75;
const JUMP_VEL = -12;
const GRAVITY_HELD_FACTOR = 0.75;
const SQUAT_MS = 50;
const SQUAT_SHIFT = 8;
const SPEED_START = 3;
const SPEED_MAX = 13;
const SPEED_TAU = 12000; // exponential easing time constant (ms)
const SCORE_K = 0.0025; // score multiplier for speed^1.5 formula
const CLEAR_TIME = 2000; // ms before first obstacle appears
const CLOUD_MIN_GAP = 200; // px — min horizontal gap between cloud spawns
const HS_KEY = "ciallo:hi";
// [character overlay — uncomment when meguru sprite is ready]
// const MEGURU_OFFSET_X = 22;
// const MEGURU_OFFSET_Y = 6;
// const MEGURU_W = 20;
// const MEGURU_H = 20;
// const MEGURU_FRAMES: Record<string, number> = {
//   normal: 0,
//   crash: 1,
// };

type Phase = "waiting" | "playing" | "crashed";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface CollisionBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ---- helpers ----
function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function overlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

/** Check if any pair of sub-boxes (relative to sprite pos) overlap */
function collides(
  px: number,
  py: number,
  dBoxes: CollisionBox[],
  ox: number,
  oy: number,
  oBoxes: CollisionBox[],
): boolean {
  for (const d of dBoxes) {
    for (const o of oBoxes) {
      if (
        px + d.x < ox + o.x + o.w &&
        px + d.x + d.w > ox + o.x &&
        py + d.y < oy + o.y + o.h &&
        py + d.y + d.h > oy + o.y
      ) {
        return true;
      }
    }
  }
  return false;
}

// ---- color theme ----
export interface GameColors {
  fg: string;
  belly: string;
  cloud: string;
  ground: string;
}

const DEFAULT_COLORS: GameColors = {
  fg: "#535353",
  belly: "#7a7a7a",
  cloud: "#d0d0d0",
  ground: "#535353",
};

// ---- obstacle types ----
interface Obstacle {
  kind: "cactus";
  size: "small" | "large" | "triple";
  x: number;
  y: number;
  w: number;
  h: number;
  yOff?: number; // visual-only vertical offset (±px), collision uses base y
}

interface Ptero {
  kind: "ptero";
  x: number;
  y: number;
  w: number;
  h: number;
  frame: number;
  frameAcc: number;
}

interface Cloud {
  x: number;
  y: number;
  w: number;
  speed: number;
}

// ---- sprite definitions (2x / HDPI coords - from Chrome HDPI spriteDef) ----
const SPR = {
  TREX: { x: 1678, y: 2, w: 88, h: 94 },
  CACTUS_SMALL: { x: 446, y: 2, w: 34, h: 70 },
  CACTUS_LARGE: { x: 652, y: 2, w: 50, h: 100 },
  CLOUD: { x: 166, y: 2, w: 92, h: 28 },
  PTERODACTYL: { x: 260, y: 2, w: 92, h: 80 },
  HORIZON: { x: 2, y: 104, w: 1200, h: 24 },
};

const DINO_FRAMES: Record<string, { frames: number[]; ms: number }> = {
  wait: { frames: [44, 0], ms: 1000 / 3 },
  run: { frames: [88, 132], ms: 1000 / 12 },
  crash: { frames: [220], ms: 1000 / 60 },
  jump: { frames: [0], ms: 1000 / 60 },
  duck: { frames: [264, 323], ms: 1000 / 8 },
};

// collision sub-boxes (1x logical, relative to sprite top-left)
const DINO_COLLISION: CollisionBox[] = [
  { x: 22, y: 0, w: 17, h: 16 }, // head
  { x: 1, y: 18, w: 30, h: 9 }, // upper back
  { x: 1, y: 24, w: 29, h: 5 }, // mid body
  { x: 5, y: 30, w: 21, h: 4 }, // lower body
  { x: 9, y: 34, w: 15, h: 4 }, // foot
  { x: 10, y: 35, w: 14, h: 8 }, // leg
];

const CACTUS_COLLISION: Record<string, CollisionBox[]> = {
  small: [
    { x: 0, y: 7, w: 5, h: 27 },
    { x: 4, y: 0, w: 6, h: 34 },
    { x: 10, y: 4, w: 7, h: 14 },
  ],
  large: [
    { x: 0, y: 12, w: 7, h: 38 },
    { x: 8, y: 0, w: 7, h: 49 },
    { x: 13, y: 10, w: 10, h: 38 },
  ],
  triple: [
    // 3× small cactus sub-boxes shifted 16px apart
    { x: 0, y: 7, w: 5, h: 27 },
    { x: 4, y: 0, w: 6, h: 34 },
    { x: 10, y: 4, w: 7, h: 14 },
    { x: 16, y: 7, w: 5, h: 27 },
    { x: 20, y: 0, w: 6, h: 34 },
    { x: 26, y: 4, w: 7, h: 14 },
    { x: 32, y: 7, w: 5, h: 27 },
    { x: 36, y: 0, w: 6, h: 34 },
    { x: 42, y: 4, w: 7, h: 14 },
  ],
};

const PTERO_COLLISION: CollisionBox[] = [
  { x: 15, y: 15, w: 16, h: 5 },
  { x: 18, y: 21, w: 24, h: 6 },
  { x: 2, y: 14, w: 4, h: 3 },
  { x: 6, y: 10, w: 4, h: 7 },
  { x: 10, y: 8, w: 6, h: 9 },
];

export class CialloGame {
  private cvs: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private raqId = 0;
  private colors: GameColors;
  private sprite: HTMLImageElement;
  private tintCache = new Map<string, HTMLCanvasElement>();
  private spriteLoaded = false;
  private phase: Phase = "waiting";

  // player
  private px = DINO_X;
  private py = 0;
  private pv = 0;
  private jumping = false;
  private spaceHeld = false;
  private squatting = false;
  private squatTimer = 0;

  // world
  private speed = SPEED_START;
  private score = 0;
  private highScore = 0;
  private runTime = 0;
  private groundX = 0;

  // obstacles
  private obstacles: (Obstacle | Ptero)[] = [];
  private obsTimer = 0;
  private lastTypes: string[] = [];

  // clouds
  private clouds: Cloud[] = [];

  // frames
  private dinoFrame = 0;
  private frameAcc = 0;

  // tick state
  private lastTick = 0;

  // callbacks
  onScore?: (s: number) => void;
  onHighScore?: (s: number) => void;
  onGameOver?: () => void;

  constructor(root: HTMLElement, colors?: GameColors) {
    this.cvs = document.createElement("canvas");
    this.cvs.className = "runner-canvas";
    const dpr = window.devicePixelRatio || 1;
    this.cvs.width = W * dpr;
    this.cvs.height = H * dpr;
    this.cvs.style.width = `${W}px`;
    this.cvs.style.height = `${H}px`;
    root.appendChild(this.cvs);
    this.ctx = this.cvs.getContext("2d")!;
    this.ctx.scale(dpr, dpr);
    this.colors = colors ?? DEFAULT_COLORS;

    this.sprite = new Image();
    this.sprite.onload = () => {
      this.spriteLoaded = true;
    };
    this.sprite.src = spriteUrl.src;

    this.py = GROUND_Y - SPR.TREX.h / 2;
    this.highScore = this.loadHighScore();
    this.spawnCloud();
    this.listen();
    this.tick(0);
  }

  // ---- public api ----
  start(): void {
    if (this.phase === "waiting") {
      this.phase = "playing";
      this.pv = JUMP_VEL;
      this.jumping = true;
    }
  }

  restart(): void {
    if (this.phase !== "crashed") return;
    this.phase = "playing";
    this.obstacles = [];
    this.groundX = 0;
    this.score = 0;
    this.speed = SPEED_START;
    this.runTime = 0;
    this.px = DINO_X;
    this.py = GROUND_Y - SPR.TREX.h / 2;
    this.pv = 0;
    this.jumping = false;
    this.dinoFrame = 0;
    this.spaceHeld = false;
    this.squatting = false;
    this.squatTimer = 0;
    this.frameAcc = 0;
    this.obsTimer = 0;
    this.lastTypes = [];
  }

  jump(): void {
    if (this.phase === "playing" && !this.jumping && !this.squatting) {
      this.squatting = true;
      this.squatTimer = SQUAT_MS;
    }
  }

  /** Return the current high score (persisted across sessions). */
  getHighScore(): number {
    return this.highScore;
  }

  // ---- lifecycle ----
  destroy(): void {
    cancelAnimationFrame(this.raqId);
  }

  private loadHighScore(): number {
    try {
      const v = localStorage.getItem(HS_KEY);
      return v ? parseInt(v, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }

  private saveHighScore(): void {
    try {
      localStorage.setItem(HS_KEY, String(this.highScore));
    } catch {
      // storage unavailable — silently skip
    }
  }

  // ---- event binding ----
  private listen(): void {
    const handler = (e: KeyboardEvent, pressed: boolean): void => {
      if (e.key === " " || e.key === "ArrowUp") {
        this.spaceHeld = pressed;
        if (pressed) {
          if (this.phase === "crashed") {
            this.restart();
          } else if (this.phase === "waiting") {
            this.start();
          } else {
            this.jump();
          }
        }
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", (e) => handler(e, true));
    document.addEventListener("keyup", (e) => handler(e, false));
  }

  // ---- game loop ----
  private tick = (now: number): void => {
    const dt = Math.min(now - (this.lastTick ?? now), 50);
    this.lastTick = now;

    if (this.phase === "playing") {
      this.update(dt);
    }

    // dino frame animation (playing + waiting)
    if (this.phase !== "crashed") {
      const animMs =
        this.phase === "waiting" ? DINO_FRAMES.wait.ms : DINO_FRAMES.run.ms;
      this.frameAcc += dt;
      while (this.frameAcc >= animMs && animMs > 0) {
        this.frameAcc -= animMs;
        this.dinoFrame = (this.dinoFrame + 1) % DINO_FRAMES.run.frames.length;
      }
    }

    this.draw();
    this.raqId = requestAnimationFrame(this.tick);
  };

  // ---- update ----
  private update(dt: number): void {
    this.runTime += dt;
    const t = dt * 0.06;

    // squat → jump transition
    if (this.squatting) {
      this.squatTimer -= dt;
      if (this.squatTimer <= 0) {
        this.squatting = false;
        this.pv = JUMP_VEL;
        this.jumping = true;
      }
    }

    // player physics (variable-height: hold space to float longer)
    if (this.jumping) {
      this.py += this.pv * t;
      this.pv += (this.spaceHeld ? GRAVITY * GRAVITY_HELD_FACTOR : GRAVITY) * t;
      if (this.py >= GROUND_Y - SPR.TREX.h / 2) {
        this.py = GROUND_Y - SPR.TREX.h / 2;
        this.jumping = false;
        this.pv = 0;
      }
    }
    // speed ramp — exponential easing: start slow, approach SPEED_MAX asymptotically
    this.speed =
      SPEED_START +
      (SPEED_MAX - SPEED_START) * (1 - Math.exp(-this.runTime / SPEED_TAU));

    // ground scroll
    this.groundX =
      (this.groundX + this.speed * dt * 0.06) % (SPR.HORIZON.w / 2);

    // obstacles
    const hasObs = this.runTime > CLEAR_TIME;
    if (hasObs) {
      this.obsTimer += dt;
      const minGap = this.calcGap();
      if (this.obsTimer >= minGap) {
        this.obsTimer = 0;
        this.spawnObstacle();
      }
      for (const o of this.obstacles) {
        o.x -= this.speed * dt * 0.06;
      }
      this.obstacles = this.obstacles.filter((o) => o.x + o.w > 0);

      // collision — two-layer: AABB outer → sub-box inner
      for (const o of this.obstacles) {
        const p: Rect = {
          x: this.px + 1,
          y: this.py + 1,
          w: SPR.TREX.w / 2 - 2,
          h: SPR.TREX.h / 2 - 2,
        };
        const q: Rect = {
          x: o.x + 1,
          y: o.y + 1,
          w: o.w - 2,
          h: o.h - 2,
        };
        if (overlap(p, q)) {
          const dinoBoxes = DINO_COLLISION;
          const obsBoxes =
            o.kind === "ptero" ? PTERO_COLLISION : CACTUS_COLLISION[o.size];
          // Sub-boxes are relative to outer AABB top-left (sprite_pos + 1),
          // matching Chrome's createAdjustedCollisionBox(subBox, outerBox).
          if (
            collides(
              this.px + 1,
              this.py + 1,
              dinoBoxes,
              o.x + 1,
              o.y + 1,
              obsBoxes,
            )
          ) {
            this.crash();
            return;
          }
        }
      }

      // pterodactyl frame animation
      for (const o of this.obstacles) {
        if (o.kind === "ptero") {
          o.frameAcc += dt;
          if (o.frameAcc > 120) {
            o.frame = o.frame ? 0 : 1;
            o.frameAcc = 0;
          }
        }
      }
    }

    // clouds
    this.cloudTimer(dt);
    for (const c of this.clouds) {
      c.x -= c.speed * dt * 0.06;
    }
    this.clouds = this.clouds.filter((c) => c.x + c.w > -60);

    // score
    this.score += this.speed ** 1.5 * dt * SCORE_K;
    this.onScore?.(Math.floor(this.score));
  }

  private crash(): void {
    this.phase = "crashed";
    if (this.score > this.highScore) {
      this.highScore = Math.floor(this.score);
      this.saveHighScore();
      this.onHighScore?.(this.highScore);
    }
    this.onGameOver?.();
  }

  // ---- spawn helpers ----
  private calcGap(): number {
    // Exponential gap: sparse early (avg ~1.9s), dense late (avg ~340ms).
    // Decays with runTime so difficulty builds smoothly, independent of speed.
    const t = this.runTime;
    const minGap = 150 + 1100 * Math.exp(-t / 15000);
    const maxGap = minGap * 2.0;
    return minGap + Math.random() * (maxGap - minGap);
  }

  private spawnObstacle(): void {
    // pterodactyl — gradual probability from speed 7→13 (10%→40%)
    if (
      this.speed >= 7 &&
      Math.random() < 0.1 + ((this.speed - 7) / (SPEED_MAX - 7)) * 0.3
    ) {
      const pteroY = [110, 70, 30][rand(0, 2)];
      this.obstacles.push({
        kind: "ptero",
        x: W + rand(0, 30),
        y: pteroY,
        w: SPR.PTERODACTYL.w / 2,
        h: SPR.PTERODACTYL.h / 2,
        frame: 0,
        frameAcc: 0,
      });
      this.lastTypes.push("ptero");
      if (this.lastTypes.length > 3) this.lastTypes.shift();
      return;
    }
    // cactus — include triple (3× small group) at speed ≥ 8
    const sz = SPR.CACTUS_SMALL;
    const lz = SPR.CACTUS_LARGE;
    const types: Array<{ type: string; w: number; h: number; y: number }> = [
      { type: "small", w: sz.w / 2, h: sz.h / 2, y: GROUND_Y - sz.h / 2 },
      { type: "large", w: lz.w / 2, h: lz.h / 2, y: GROUND_Y - lz.h / 2 },
    ];
    if (this.speed >= 8) {
      // triple: 3 small cacti side-by-side, 16px apart
      types.push({
        type: "triple",
        w: 49,
        h: sz.h / 2,
        y: GROUND_Y - sz.h / 2,
      });
    }
    let idx = rand(0, types.length - 1);
    for (let safety = 0; safety < 5; safety++) {
      const t = types[idx].type;
      if (this.lastTypes.filter((x) => x === t).length < 2) break;
      idx = (idx + 1) % types.length;
    }
    const t = types[idx];
    this.lastTypes.push(t.type);
    if (this.lastTypes.length > 3) this.lastTypes.shift();
    this.obstacles.push({
      kind: "cactus",
      size: t.type as "small" | "large" | "triple",
      x: W + rand(0, 30),
      y: t.y,
      w: t.w,
      h: t.h,
      yOff: rand(-3, 3),
    });
  }

  private cloudTimer(dt: number): void {
    if (this.clouds.length >= 6) return;
    const rightmost = Math.max(...this.clouds.map((c) => c.x));
    if (rightmost > W - CLOUD_MIN_GAP) return;
    if (Math.random() < 0.002 * dt) {
      this.spawnCloud();
    }
  }

  private spawnCloud(): void {
    this.clouds.push({
      x: W,
      y: rand(10, H * 0.35),
      w: SPR.CLOUD.w / 2,
      speed: 0.2 + Math.random() * 0.5,
    });
  }

  // ---- sprite helpers ----
  private getTintedFrame(
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    color: string,
  ): HTMLCanvasElement {
    const key = `${sx},${sy},${sw},${sh},${color}`;
    const cached = this.tintCache.get(key);
    if (cached) return cached;
    const c = document.createElement("canvas");
    c.width = sw;
    c.height = sh;
    const cx = c.getContext("2d")!;

    // 1. draw sprite (white background)
    cx.drawImage(this.sprite, sx, sy, sw, sh, 0, 0, sw, sh);

    // 2. remove white background → transparent
    const imgData = cx.getImageData(0, 0, sw, sh);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] > 240 && d[i + 1] > 240 && d[i + 2] > 240) {
        d[i + 3] = 0;
      }
    }
    cx.putImageData(imgData, 0, 0);

    // 3. tint remaining pixels with color via source-atop
    cx.globalCompositeOperation = "source-atop";
    cx.fillStyle = color;
    cx.fillRect(0, 0, sw, sh);

    this.tintCache.set(key, c);
    return c;
  }

  /** Get tinted sprite at 2x resolution. frameOffset is in 1x logical pixels (doubled internally). */
  private tintedImage(
    spr: (typeof SPR)[keyof typeof SPR],
    color: string,
    frameOffset = 0,
  ): HTMLCanvasElement {
    const sx = spr.x + frameOffset * 2;
    const sy = spr.y;
    const sw = spr.w;
    const sh = spr.h;
    return this.getTintedFrame(sx, sy, sw, sh, color);
  }

  // ---- draw ----
  private draw(): void {
    if (!this.spriteLoaded) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, W, H);

    // clouds
    for (const c of this.clouds) {
      const img = this.tintedImage(SPR.CLOUD, this.colors.cloud);
      ctx.drawImage(img, c.x, c.y, SPR.CLOUD.w / 2, SPR.CLOUD.h / 2);
    }

    // ground — dual-segment scrolling
    const gx = -this.groundX;
    const gy = GROUND_Y - SPR.HORIZON.h / 2 + 4;
    const hw = SPR.HORIZON.w / 2;
    const hh = SPR.HORIZON.h / 2;
    const hImg = this.tintedImage(SPR.HORIZON, this.colors.ground);
    ctx.drawImage(hImg, gx, gy, hw, hh);
    ctx.drawImage(hImg, gx + hw, gy, hw, hh);

    // obstacles
    for (const o of this.obstacles) {
      if (o.kind === "ptero") {
        this.drawPtero(ctx, o);
      } else {
        this.drawCactus(ctx, o);
      }
    }

    // player
    this.drawDino(ctx);
  }

  private drawDino(ctx: CanvasRenderingContext2D): void {
    const anim =
      this.phase === "crashed"
        ? DINO_FRAMES.crash
        : this.phase === "waiting"
          ? DINO_FRAMES.wait
          : this.jumping
            ? DINO_FRAMES.jump
            : DINO_FRAMES.run;

    const frameIdx = this.dinoFrame % anim.frames.length;
    const frameOff = anim.frames[frameIdx];
    const tw = SPR.TREX.w / 2;
    const th = SPR.TREX.h / 2;

    const drawY = this.py + (this.squatting ? SQUAT_SHIFT : 0);

    // body: full dino in fg color
    const fgImg = this.tintedImage(SPR.TREX, this.colors.fg, frameOff);
    ctx.drawImage(fgImg, this.px, drawY, tw, th);

    // belly: bottom ~45% in belly color, clipped to dino silhouette
    const bellyImg = this.tintedImage(SPR.TREX, this.colors.belly, frameOff);
    ctx.save();
    ctx.beginPath();
    ctx.rect(this.px, drawY + th * 0.55, tw, th * 0.45);
    ctx.clip();
    ctx.globalCompositeOperation = "source-atop";
    ctx.drawImage(bellyImg, this.px, drawY, tw, th);
    ctx.restore();
    // [uncomment when meguru sprite is ready]
    // const meguruFrame = this.phase === "crashed"
    //   ? MEGURU_FRAMES.crash
    //   : MEGURU_FRAMES.normal;
    // const mc = this.getMeguruFrame(meguruFrame);
    // ctx.drawImage(mc, this.px + MEGURU_OFFSET_X, drawY + MEGURU_OFFSET_Y, MEGURU_W, MEGURU_H);
  }

  private drawCactus(ctx: CanvasRenderingContext2D, o: Obstacle): void {
    const drawY = o.y + (o.yOff ?? 0);
    if (o.size === "triple") {
      // Draw 3 small cacti side-by-side at 16px offset each
      const img = this.tintedImage(SPR.CACTUS_SMALL, this.colors.fg);
      for (let i = 0; i < 3; i++) {
        ctx.drawImage(
          img,
          o.x + i * 16,
          drawY,
          SPR.CACTUS_SMALL.w / 2,
          SPR.CACTUS_SMALL.h / 2,
        );
      }
    } else {
      const spr = o.size === "small" ? SPR.CACTUS_SMALL : SPR.CACTUS_LARGE;
      const img = this.tintedImage(spr, this.colors.fg);
      ctx.drawImage(img, o.x, drawY, o.w, o.h);
    }
  }

  private drawPtero(ctx: CanvasRenderingContext2D, o: Ptero): void {
    const frameOff = o.frame * (SPR.PTERODACTYL.w / 2);
    const img = this.tintedImage(SPR.PTERODACTYL, this.colors.fg, frameOff);
    ctx.drawImage(img, o.x, o.y, o.w, o.h);
  }
}
