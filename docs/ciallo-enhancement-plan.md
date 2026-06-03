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

### 1.2 Canvas 背景与绘制颜色（`ciallo-game.ts`）

**现状**：

- 背景 `#f7f7f7` 硬编码
- 恐龙、仙人掌、地面、云朵全部 `#535353` 硬编码
- 不感知任何主题

**目标**：

- 画布背景应为一条色带，适配暗黑/明亮模式：暗色 → 半透明暗底，亮色 → 半透明浅底
- 移动中的对象（恐龙、仙人掌、云朵、地面标记）在暗色模式下偏白/亮，亮色模式下偏黑/暗
- 非移动的静态元素（画布底色）保持低调，仅作背景容器

**方案**：

通过 `getComputedStyle(document.documentElement).getPropertyValue('--foreground')` 等 CSS 变量实时读取主题色，或构造函数接收颜色配置对象。

```
// 色彩映射示例
light: {
  bg:        "#f7f7f7",       // 画布背景（浅白）
  fg:        "#535353",       // 移动对象（暗灰）
  cloud:     "#d0d0d0",
  ground:    "#535353",
}
dark: {
  bg:        "#2a3045",       // 画布背景（深蓝灰）
  fg:        "#d0d4dc",       // 移动对象（亮灰白）
  cloud:     "#4a5070",
  ground:    "#d0d4dc",
}
```

实现上：去掉 `clearRect` 硬编码背景填充，让 canvas CSS background 显示。移动对象通过 `setColors()` 方法或构造函数配置。

## 二、游戏机制优化

### 2.1 碰撞判定修复

**现状**（`ciallo-game.ts:206-219`）：

```javascript
const p: Rect = { x: this.px + 4, y: this.py + 4, w: 36, h: 36 };
const q: Rect = { x: o.x + 2, y: o.y + 2, w: o.w - 4, h: o.h - 4 };
```

**问题**：
| 维度 | 碰撞盒 vs 视觉 | 偏差 |
|---|---|---|
| 恐龙上边 | py+4 vs py+1 | 碰撞盒下沉 3px |
| 恐龙下边 | py+40 vs py+42 | 碰撞盒缺底 2px |
| 仙人掌上边 | oy+2 vs oy+1.5 | 碰撞盒下沉 ~0.5px |
| 仙人掌下边 | oy+33 vs oy+35 | 碰撞盒缺底 2px |

**后果**：视觉上恐龙已接触仙人掌时，碰撞盒在上下各有约 5px 的死角。用户观察到"碰到但未结束"。

**修复**：将 padding 缩小或去除，使碰撞盒紧密包裹视觉边界：

```javascript
const p: Rect = { x: this.px, y: this.py, w: 38, h: 44 };
const q: Rect = { x: o.x, y: o.y, w: o.w, h: o.h };
```

或根据视觉实际边界精确调整。

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

**现状**（`ciallo-game.ts:117-122`）：

```javascript
jump(): void {
  if (this.phase === "playing" && !this.jumping) {
    this.pv = JUMP_VEL;
    this.jumping = true;
  }
}
```

- `JUMP_VEL=-12`，固定高度（~120px，~667ms）
- 无可变高度
- 无 squat 预备动画

**问题**：

- 按多久跳一样高 → 手感僵硬
- 起跳前无蓄力视觉反馈

**修复**：

1. **Variable-height jump**：按住空格降低重力系数（`GRAVITY * 0.5`），松开恢复原重力。记录 `spaceHeld` 状态，在 `update()` 中条件判断。

2. **Squat 动画**：跳跃前一帧让恐龙下蹲（减少高度 ~8px），第 2 帧起跳。视觉上形成「蓄力→弹起」的节奏。

## 三、优先顺序建议

| 优先级 | 模块                      | 工作量 | 影响           | 状态   |
| ------ | ------------------------- | ------ | -------------- | ------ |
| P0     | 碰撞判定修复              | 小     | 核心体验 bug   | -      |
| P0     | Canvas 颜色适配           | 中     | 暗色模式可读性 | -      |
| P1     | 跳跃手感（variable jump） | 中     | 操作体验       | -      |
| P1     | 速度曲线 + 得分           | 中     | 游戏节奏       | -      |
| P2     | 障碍物密度/高度           | 中     | 难度曲线       | -      |
| P2     | 浮动文字颜色/字体         | 小     | 视觉效果       | 已完成 |
