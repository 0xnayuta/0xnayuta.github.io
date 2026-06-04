// Self-contained Canvas dino-runner game.
// Zero external dependencies — no sprites, no audio blobs.

const W = 600,
  H = 150;
const GROUND_Y = 127;
const DINO_X = 50;

// physics
const GRAVITY = 0.6;
const JUMP_VEL = -12;
const SPEED_START = 6;
const SPEED_MAX = 13;
const ACCEL = 0.001;
const CLEAR_TIME = 3000; // ms before first obstacle appears

type Phase = "waiting" | "playing" | "crashed";

interface Rect {
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

// ---- main game class ----
export class CialloGame {
  private cvs: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private raqId = 0;
  private colors: GameColors;
  private phase: Phase = "waiting";

  // player
  private px = DINO_X;
  private py = 0;
  private pv = 0;
  private jumping = false;
  private blinkTimer = 0;
  private blinkState = false;

  // world
  private speed = SPEED_START;
  private score = 0;
  private highScore = 0;
  private runTime = 0;
  private groundX = 0;

  // obstacles
  private obstacles: Cactus[] = [];
  private obsTimer = 0;
  private lastTypes: string[] = [];

  // clouds
  private clouds: Cloud_[] = [];

  // frames
  private dinoFrame = 0; // 0|1 leg position
  private frameAcc = 0;

  // callbacks
  onScore?: (s: number) => void;
  onHighScore?: (s: number) => void;
  onGameOver?: () => void;

  constructor(root: HTMLElement, colors?: GameColors) {
    this.cvs = document.createElement("canvas");
    this.cvs.width = W;
    this.cvs.height = H;
    this.cvs.className = "runner-canvas";
    root.appendChild(this.cvs);
    this.ctx = this.cvs.getContext("2d")!;
    this.colors = colors ?? DEFAULT_COLORS;

    this.py = GROUND_Y - 44;
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
    this.py = GROUND_Y - 44;
    this.pv = 0;
    this.jumping = false;
    this.dinoFrame = 0;
    this.frameAcc = 0;
    this.obsTimer = 0;
    this.lastTypes = [];
    this.blinkTimer = 0;
  }

  // ---- input ----
  jump(): void {
    if (this.phase === "playing" && !this.jumping) {
      this.pv = JUMP_VEL;
      this.jumping = true;
    }
  }
  duck(): void {
    // stub — duck not implemented
  }

  // ---- lifecycle ----
  destroy(): void {
    cancelAnimationFrame(this.raqId);
  }

  // ---- event binding ----
  private listen(): void {
    document.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "ArrowUp") {
        if (this.phase === "crashed") {
          this.restart();
        } else if (this.phase === "waiting") {
          this.start();
        } else {
          this.jump();
        }
        e.preventDefault();
      }
      if (e.key === "ArrowDown" && this.phase === "playing") {
        this.duck();
        e.preventDefault();
      }
    });
    document.addEventListener("keyup", (e) => {
      if (e.key === "ArrowDown") this.duck();
    });
  }

  // ---- game loop ----
  private tick = (now: number): void => {
    const dt = Math.min(now - (this._last ?? now), 50); // cap at 50ms
    this._last = now;

    if (this.phase === "playing") {
      this.update(dt);
    } else if (this.phase === "waiting") {
      this.updateBlink(dt);
    }
    this.draw();
    this.raqId = requestAnimationFrame(this.tick);
  };
  private _last = 0;

  // ---- update ----
  private update(dt: number): void {
    this.runTime += dt;

    // player physics
    if (this.jumping) {
      this.py += this.pv;
      this.pv += GRAVITY;
      if (this.py >= GROUND_Y - 44) {
        this.py = GROUND_Y - 44;
        this.jumping = false;
        this.pv = 0;
      }
    }

    // speed ramp
    if (this.speed < SPEED_MAX) this.speed += ACCEL * dt;

    // ground scroll
    this.groundX = (this.groundX + this.speed * dt * 0.06) % 20;

    // obstacles
    const hasObs = this.runTime > CLEAR_TIME;
    if (hasObs) {
      this.obsTimer += dt;
      const minGap = this.calcGap();
      if (this.obsTimer >= minGap) {
        this.obsTimer = 0;
        this.spawnCactus();
      }
      for (const o of this.obstacles) {
        o.x -= this.speed * dt * 0.06;
      }
      this.obstacles = this.obstacles.filter((o) => o.x + o.w > -50);

      // collision
      if (this.obstacles[0]) {
        const o = this.obstacles[0];
        const p: Rect = {
          x: this.px,
          y: this.py,
          w: 38,
          h: 44,
        };
        const q: Rect = { x: o.x, y: o.y, w: o.w, h: o.h };
        if (overlap(p, q)) {
          this.crash();
          return;
        }
      }
    }

    // clouds
    this.cloudTimer(dt);
    for (const c of this.clouds) {
      c.x -= c.speed * dt * 0.06;
    }
    this.clouds = this.clouds.filter((c) => c.x + c.w > -60);

    // running animation
    this.frameAcc += dt;
    if (this.frameAcc > 80) {
      this.dinoFrame = this.dinoFrame ? 0 : 1;
      this.frameAcc = 0;
    }

    // score
    this.score += ((this.speed * dt) / 16.67) * 0.025;
    this.onScore?.(Math.floor(this.score));
  }

  private updateBlink(dt: number): void {
    this.blinkTimer += dt;
    if (this.blinkTimer > 4000) {
      this.blinkState = !this.blinkState;
      this.blinkTimer = 0;
    }
  }

  private crash(): void {
    this.phase = "crashed";
    if (this.score > this.highScore) {
      this.highScore = Math.floor(this.score);
      this.onHighScore?.(this.highScore);
    }
    this.onGameOver?.();
  }

  // ---- spawn helpers ----
  private calcGap(): number {
    const base = 180 + Math.random() * 100;
    return Math.max(base - this.speed * 10, 100);
  }

  private spawnCactus(): void {
    const types: Array<{ type: string; w: number; h: number; y: number }> = [
      { type: "small", w: 17, h: 35, y: GROUND_Y - 35 },
      { type: "large", w: 25, h: 50, y: GROUND_Y - 50 },
    ];
    // prevent 3-in-a-row duplicates
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
      x: W + rand(0, 30),
      y: t.y,
      w: t.w,
      h: t.h,
    });
  }

  private cloudTimer(dt: number): void {
    if (this.clouds.length < 6 && Math.random() < 0.002 * dt) {
      this.spawnCloud();
    }
  }

  private spawnCloud(): void {
    this.clouds.push({
      x: W,
      y: rand(10, 60),
      w: rand(30, 50),
      speed: 0.3 + Math.random() * 0.2,
    });
  }

  // ---- draw ----
  private draw(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, W, H);

    // sky

    // clouds
    for (const c of this.clouds) {
      ctx.fillStyle = this.colors.cloud;
      this.roundRect(c.x, c.y, c.w, 12, 6);
      ctx.fill();
    }

    // ground
    ctx.strokeStyle = this.colors.ground;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(W, GROUND_Y);
    ctx.stroke();

    // ground bumps
    ctx.fillStyle = this.colors.ground;
    for (let gx = -this.groundX; gx < W; gx += 20) {
      ctx.fillRect(gx, GROUND_Y + 3, 4, 4);
    }

    // obstacles
    for (const o of this.obstacles) {
      this.drawCactus(ctx, o);
    }

    // player
    this.drawDino(ctx);
  }

  // ---- draw: dino ----
  private drawDino(ctx: CanvasRenderingContext2D): void {
    const x = this.px,
      y = this.py;
    const crashed = this.phase === "crashed";
    const blink = this.phase === "waiting" && this.blinkState;

    ctx.save();
    ctx.translate(x, y);

    // body
    ctx.fillStyle = this.colors.fg;
    ctx.beginPath();
    ctx.ellipse(18, 22, 16, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // head (overlapping circle above body)
    ctx.beginPath();
    ctx.ellipse(26, 10, 11, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // tail
    ctx.beginPath();
    ctx.moveTo(0, 22);
    ctx.lineTo(-12, 18);
    ctx.lineTo(-8, 26);
    ctx.closePath();
    ctx.fill();

    // mouth
    if (crashed) {
      // open mouth
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(33, 15, 3, 0, Math.PI);
      ctx.fill();
    }

    // eye
    if (crashed) {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(29, 6);
      ctx.lineTo(34, 10);
      ctx.moveTo(34, 6);
      ctx.lineTo(29, 10);
      ctx.stroke();
    } else if (blink) {
      // eye closed (line)
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(29, 8);
      ctx.lineTo(34, 8);
      ctx.stroke();
    } else {
      // normal eye
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(31, 8, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#222";
      ctx.beginPath();
      ctx.arc(32, 8, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // legs
    if (!crashed || this.jumping) {
      ctx.fillStyle = this.colors.fg;
      const legLen = crashed ? 0 : this.jumping ? 8 : 6;
      // left leg
      const lOff = this.dinoFrame ? 2 : -2;
      ctx.fillRect(12 + lOff, 36, 7, legLen);
      ctx.fillRect(20 - lOff, 36, 7, legLen);
    }

    // arms (tiny trex arms)
    ctx.fillStyle = this.colors.fg;
    ctx.fillRect(14, 24, 4, 6);
    ctx.fillRect(22, 24, 4, 6);

    // belly highlight
    ctx.fillStyle = this.colors.belly;
    ctx.beginPath();
    ctx.ellipse(18, 26, 9, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ---- draw: cactus ----
  private drawCactus(ctx: CanvasRenderingContext2D, o: Cactus): void {
    ctx.fillStyle = this.colors.fg;
    // trunk
    ctx.fillRect(o.x + 4, o.y + 6, o.w - 8, o.h - 6);
    // top
    ctx.beginPath();
    ctx.arc(o.x + o.w / 2, o.y + 6, (o.w - 8) / 2, Math.PI, 0);
    ctx.fill();
    // spikes
    for (let sy = o.y + 10; sy < o.y + o.h - 10; sy += 8) {
      ctx.fillRect(o.x, sy, 4, 4);
      ctx.fillRect(o.x + o.w - 4, sy, 4, 4);
    }
  }

  // ---- draw: round rect helper ----
  private roundRect(
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ): void {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }
}

// ---- types ----
interface Cactus {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Cloud_ {
  x: number;
  y: number;
  w: number;
  speed: number;
}
