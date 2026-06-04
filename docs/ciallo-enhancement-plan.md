# Ciallo 彩蛋增强记录

## 概述

对 `/ciallo/` 页面（Dino Runner 复刻）的界面 UI 和游戏机制进行全面分析与优化。

## 一、界面 UI 美化

### 1.1 浮动 Ciallo 文字（`ciallo-effects.ts`）

**现状（优化前）**：

- `randomHex()` 从全 `0xFFFFFF` 取色，不感知主题
- 仅 `font-weight: bold`，无字体变化
- 两个固定变体（★/☆），无额外变体
- 空格键触发时位置固定在 `(100, 200)`
- 文字左边缘锚定点击位置，视觉偏右

**完成项**：

- [x] **颜色主题适配**：HSL 约束随机色。暗色模式 `hsl(h, 80%, 70%)`，亮色模式 `hsl(h, 60%, 50%)`。通过 `getTheme()` 读取 `data-theme` 属性，降级到 `prefers-color-scheme`
- [x] **字体多样性（方案 A — CSS font-stack 回退）**：引入两个子集化装饰字体（ZCOOL KuaiLe ~2.1KB, ZCOOL QingKe HuangYou ~6.6KB），仅保留 `Ciallo～(< )⌒` 所需字符。CSS font-stack 自动回退到站默认字体渲染 `∠・ω⌒★☆`。每次随机选 KuaiLe / QingKe / 默认三者之一，随机 `font-weight` (400/700/900)
- [x] **点击位置水平居中**：CSS `translate: -50% 0` 独立于 `transform` 动画，定位与动画职责分离
- [x] **空格键随机分布**：`spawnFloatingCiallo()` 无参调用时，在可见视口内均匀随机（水平留边 80px，垂直留边 60px），点击/触摸链保持传入真实坐标不变

**实现**（`ciallo-effects.ts`）：

```typescript
// 颜色 — HSL 约束生成
function randomThemeColor(): string {
  const isDark = getTheme() === "dark";
  const h = Math.floor(Math.random() * 360);
  const s = isDark ? 80 : 60;
  const l = isDark ? 70 : 50;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// 字体 — 3 候选
const FONTS = [
  '"ciallo-kuaile", var(--font-app), cursive',
  '"ciallo-qingke", var(--font-app), sans-serif',
  "var(--font-app)",
];

// 定位 — 居中 via CSS translate（独立于 transform 动画）
translate: -50 % 0;

// 空格键 → 随机位置，点击/触摸 → 真实坐标
export function spawnFloatingCiallo(x?: number, y?: number): void {
  if (x === undefined || y === undefined) {
    const mX = 80,
      mY = 60;
    x = mX + Math.random() * (innerWidth - mX * 2);
    y = mY + Math.random() * (innerHeight - mY - 120);
  }
  // ...
}
```

**相关文件**：

| 文件                                            | 作用                                                    |
| ----------------------------------------------- | ------------------------------------------------------- |
| `src/components/ciallo/ciallo-effects.ts`       | 浮动文字效果（颜色、字体、定位逻辑）                    |
| `src/components/ciallo/CialloGameWrapper.astro` | `@font-face` 声明（组件内联，仅 `/ciallo/` 页面加载）   |
| `src/assets/fonts/ciallo-kuaile.ttf`            | ZCOOL KuaiLe 子集版（2.1KB，Vite 自动 base64 内联）     |
| `src/assets/fonts/ciallo-qingke.ttf`            | ZCOOL QingKe HuangYou 子集版（6.6KB，独立 hashed 文件） |
| `scripts/subset-fonts.js`                       | 字体子集化（仅保留 `Ciallo～(< )⌒` 所需字符）           |

### 1.2 Canvas 绘制渲染（`ciallo-game.ts`）

**现状（优化前）**：

- 几何绘图（`fillRect`/`roundRect` 绘制恐龙、仙人掌、云朵、地面）
- 背景 `#f7f7f7` 硬编码
- 恐龙、仙人掌、地面、云朵全部 `#535353` 硬编码
- 不感知任何主题

**完成项**：

- [x] **画布底色透明化**：删除 `fillRect` 硬编码背景填充，仅保留 `clearRect`。Canvas 完全透明，页面 `--background` 直接透出，不再突兀白色条带
- [x] **Chrome T-Rex Runner 精灵图渲染**：使用 Chromium BSD 许可的 `200-offline-sprite.png` 替代全部几何绘图。导入方式：`import spriteUrl from "../assets/images/sprite.png"`。所有精灵定义使用 HDPI 2x 坐标，绘制时除以 2 映射到 1x 逻辑画布
- [x] **主题色合成**：通过 `getImageData` 移除白底 + `globalCompositeOperation: "source-atop"` 着色，`tintCache` 缓存已着色帧。着色仅影响非透明像素，保留精灵原生的明暗对比
- [x] **精灵动画帧**：恐龙 6 组帧（等待/奔跑×2/跳跃/碰撞/眨眼），翼龙 2 帧，云朵/地面/仙人掌静态单帧

**实现**（`ciallo-game.ts`）：

```typescript
// 精灵加载
import spriteUrl from "../assets/images/sprite.png";

private tintCache = new Map<string, HTMLCanvasElement>();
private spriteLoaded = false;

// 主题色合成：移除白底 → source-atop 染色 → 缓存
private getTintedFrame(sx, sy, sw, sh, color): HTMLCanvasElement {
  const key = `${sx},${sy},${sw},${sh},${color}`;
  const cached = this.tintCache.get(key);
  if (cached) return cached;
  const c = document.createElement("canvas");
  c.width = sw; c.height = sh;
  const cx = c.getContext("2d")!;
  // 1. 绘制原图 → 2. 移除白底 → 3. source-atop 着色
  cx.drawImage(this.sprite, sx, sy, sw, sh, 0, 0, sw, sh);
  const d = cx.getImageData(0, 0, sw, sh).data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] > 240 && d[i+1] > 240 && d[i+2] > 240) d[i+3] = 0;
  }
  cx.putImageData(imgData, 0, 0);
  cx.globalCompositeOperation = "source-atop";
  cx.fillStyle = color;
  cx.fillRect(0, 0, sw, sh);
  this.tintCache.set(key, c);
  return c;
}
```

**新增内容**：

- 翼龙（Pterodactyl）障碍物类型：速度 ≥ 8.5 时 30% 概率出现，3 个高度层（100/75/50），2 帧动画
- 地面滚动：双段 600px 地平线精灵滚动，替代 `line`+`fillRect` 点状地面
- 云朵：精灵图替代 `roundRect`

**相关文件**：

| 文件                                   | 作用                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------ |
| `src/scripts/ciallo-game.ts`           | `GameColors` 接口、`DEFAULT_COLORS`、精灵加载与着色、6 组 draw 方法            |
| `src/pages/ciallo.astro`               | 定义 `LIGHT_COLORS` / `DARK_COLORS` + `currentThemeColors()`；实例化时传入配色 |
| `src/assets/images/sprite.png`         | Chrome T-Rex Runner `200-offline-sprite.png`（BSD 许可）                       |
| `docs/ciallo-visual-alignment-plan.md` | 完整精灵渲染方案设计文档                                                       |

## 二、游戏机制优化

### 2.1 碰撞判定（`ciallo-game.ts`）

**现状（优化前）**：

```typescript
const p: Rect = { x: this.px + 4, y: this.py + 4, w: 36, h: 36 };
const q: Rect = { x: o.x + 2, y: o.y + 2, w: o.w - 4, h: o.h - 4 };
```

单层 AABB 碰撞盒，恐龙各边 3–4px 内缩、仙人掌各边 0.5–2px 内缩。上下合计约 5px 的死角 → "碰到但未结束"。

**完成项**：

- [x] **两层碰撞检测**：外圈 1px 内缩 AABB（快速滤除远处障碍）→ 内层子盒逐对检测（精准判定）。恐龙 6 子盒（头/上背/中身/下体/脚/腿），仙人掌 3 子盒（小/大各一套），翼龙 5 子盒
- [x] **子盒定义**：从 Chrome T-Rex Runner 坐标系换算（HDPI 坐标 ÷ 2），紧密包裹各部位轮廓
- [x] **CollisionBox 扁平化**：`CACTUS_COLLISION` 以 `Record<string, CollisionBox[]>` 按尺寸分类，无需 `.flat()` 或运行时推断

**实现**（`ciallo-game.ts`）：

```typescript
// 外层快速 AABB（每边 1px 内缩）
const p: Rect = {
  x: this.px + 1,
  y: this.py + 1,
  w: SPR.TREX.w / 2 - 2,
  h: SPR.TREX.h / 2 - 2,
};
const q: Rect = { x: o.x + 1, y: o.y + 1, w: o.w - 2, h: o.h - 2 };
if (overlap(p, q)) {
  // 内层子盒逐对碰撞，相对外盒坐标计算
  const dinoBoxes = DINO_COLLISION; // CollisionBox[]
  const obsBoxes =
    o.kind === "ptero" ? PTERO_COLLISION : CACTUS_COLLISION[o.size]; // 直接引用扁平数组
  // Sub-boxes 相对外盒 (sprite_pos + 1)，match Chrome's createAdjustedCollisionBox
  if (
    collides(this.px + 1, this.py + 1, dinoBoxes, o.x + 1, o.y + 1, obsBoxes)
  ) {
    this.crash();
    return;
  }
}
```

**子盒定义**（1x 逻辑坐标，相对于精灵左上角）：

```typescript
const DINO_COLLISION: CollisionBox[] = [
  { x: 22, y: 0, w: 17, h: 16 }, // 头
  { x: 1, y: 18, w: 30, h: 9 }, // 上背
  { x: 1, y: 24, w: 29, h: 5 }, // 中身
  { x: 5, y: 30, w: 21, h: 4 }, // 下体
  { x: 9, y: 34, w: 15, h: 4 }, // 脚
  { x: 10, y: 35, w: 14, h: 8 }, // 腿
];
```

**相关文件**：

| 文件                                   | 作用                      |
| -------------------------------------- | ------------------------- |
| `src/scripts/ciallo-game.ts`           | 两阶段碰撞检测 + 子盒定义 |
| `docs/ciallo-visual-alignment-plan.md` | 子盒来源与坐标系换算说明  |

### 2.2 速度曲线

**现状**（`ciallo-game.ts:186`）：

```javascript
if (this.speed < SPEED_MAX) this.speed += ACCEL * dt;
```

线性加速，`SPEED_START=6`, `SPEED_MAX=13`, `ACCEL=0.001`。约 7 秒到达最大速度。

**问题**：

- 起始速度 6 过快，新手无反应时间
- 线性加速 → 全场感觉一致，无「开始慢→逐步快」的缓入感

**修复**：将起始速度降至 3-4，使用指数缓入曲线：

```javascript
speed = SPEED_START + (SPEED_MAX - SPEED_START) * ((1 - e) ^ (-runTime / T));
```

`T` 控制加速时间常数（如 T=15000ms），使初始段增长平缓，中段加速明显。

### 2.3 得分机制

**现状**（`ciallo-game.ts:237`）：

```javascript
this.score += ((this.speed * dt) / 16.67) * 0.025;
```

线性正比于速度，乘数 0.025。速度 6 → ~9 分/秒，速度 13 → ~19.5 分/秒。

**问题**：高速 vs 低速的得分差异不够显著（仅 2.2x）。

**修复**：改为超线性关系，如 `score += speed^1.5 * dt * k`，使高速阶段得分明显加快。

### 2.4 障碍物密度与高度

**现状**（`ciallo-game.ts:259-262`）：

```javascript
private calcGap(): number {
  const base = 180 + Math.random() * 100;
  return Math.max(base - this.speed * 10, 100);
}
```

- 硬编码最小间隔 100px（速度 6 时约 277ms 过一障碍）
- CLEAR_TIME=3000ms 后立即有障碍
- 只有两种固定尺寸（小 17×35, 大 25×50）

**问题**：

- 间隔随速度减小但下限太低，高难度期过于密集
- 高度无变化，不随游戏进程增长
- 障碍物在早期就应该更稀疏

**修复**：

```
gap = baseGap * (SPEED_START / speed) × 变速因子
```

初始最小间隔设 400-500ms，随 `runTime` 非线性缩短到 150-200ms 最小值。引入第三个更大的 cactus 变体（w=30, h=65），后期随机出现。

### 2.5 跳跃手感

**现状（优化前）**：

- `JUMP_VEL=-12`，固定高度（~120px，~667ms），按多久跳一样高
- 无可变高度（按住空格不改变重力）
- 起跳无 squat 蓄力视觉反馈
- `jump()` 方法直接设置 `pv = JUMP_VEL; jumping = true;`

**完成项**：

- [x] **Variable-height jump**：按住空格降低重力系数（`GRAVITY_HELD_FACTOR = 0.75`），松开恢复原重力 `GRAVITY`。通过 `spaceHeld` 状态在 `update()` 中条件判断，按住时下落更慢、跳得更高
- [x] **Squat 动画（蓄力→弹起）**：跳跃前 50ms 恐龙下蹲 8px，第 50ms 后起跳。`jump()` 只设 `squatting = true`，`update()` 中倒计时结束后才设 `pv = JUMP_VEL; jumping = true`。绘制时 `drawY = py + SQUAT_SHIFT`（仅下蹲帧偏移）
- [x] **事件响应改进**：`keydown` 设 `spaceHeld = true`，`keyup` 设 `false`，不与跳跃触发耦合。`jump()` 是单独的按键事件，`spaceHeld` 在物理更新中独立判断

**实现**（`ciallo-game.ts`）：

```typescript
// 常量
const GRAVITY = 0.6;
const JUMP_VEL = -12;
const GRAVITY_HELD_FACTOR = 0.75; // 按住空格时重力乘数（<1 → 滞空更久）
const SQUAT_MS = 50;              // 蓄力持续时间
const SQUAT_SHIFT = 8;            // 下蹲视觉偏移量

// 跳跃入口（仅设 squat，不直接起跳）
jump(): void {
  if (this.phase === "playing" && !this.jumping && !this.squatting) {
    this.squatting = true;
    this.squatTimer = SQUAT_MS;
  }
}

// update() — squat → jump 过渡
if (this.squatting) {
  this.squatTimer -= dt;
  if (this.squatTimer <= 0) {
    this.squatting = false;
    this.pv = JUMP_VEL;
    this.jumping = true;
  }
}

// update() — 可变高度物理
if (this.jumping) {
  this.py += this.pv * t;
  this.pv += (this.spaceHeld
    ? GRAVITY * GRAVITY_HELD_FACTOR   // 按住 → 慢下落
    : GRAVITY                          // 松开 → 正常下落
  ) * t;
  if (this.py >= GROUND_Y - SPR.TREX.h / 2) {
    this.py = GROUND_Y - SPR.TREX.h / 2;
    this.jumping = false;
    this.pv = 0;
  }
}

// 绘制 — squat 偏移
const drawY = this.py + (this.squatting ? SQUAT_SHIFT : 0);
ctx.drawImage(img, this.px, drawY, tw, th);

// 事件绑定 — spaceHeld 独立于 jump() 触发
this.spaceHeld = pressed;  // keydown→true, keyup→false
```

**相关文件**：

| 文件                             | 作用                                                    |
| -------------------------------- | ------------------------------------------------------- |
| `src/scripts/ciallo-game.ts`     | `jump()`、squat→jump 过渡、可变高度物理、事件绑定、绘制 |
| `src/pages/ciallo.astro`         | 无直接变更（游戏逻辑全部封装在 `ciallo-game.ts`）        |

## 三、优先顺序建议

| 优先级 | 模块                         | 工作量 | 影响                | 状态   |
| ------ | ---------------------------- | ------ | ------------------- | ------ |
| P0     | 碰撞判定（子盒系统）         | 大     | 核心体验 bug        | 已完成 |
| P0     | Canvas 精灵渲染 + 主题色适配 | 大     | 暗色模式 + 视觉效果 | 已完成 |
| P1     | 跳跃手感（variable jump）    | 中     | 操作体验            | 已完成 |
| P1     | 速度曲线 + 得分              | 中     | 游戏节奏            | -      |
| P2     | 障碍物密度/高度              | 中     | 难度曲线            | -      |
| P2     | 浮动文字颜色/字体            | 小     | 视觉效果            | 已完成 |
