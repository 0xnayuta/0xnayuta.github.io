# Chrome T-Rex Runner 参考分析

## 背景

`../t-rex-runner/` 是从 Chromium 源码提取的 Chrome 离线小恐龙游戏（T-Rex Runner）。`ciallo-game.ts` 是该游戏的 Canvas 重实现版，目前用几何绘图（椭圆、弧、矩形）代替精灵图。本文档记录 Ciallo 可以借鉴的 Chrome 方案。

参考文件：`../t-rex-runner/index.js`（2745 行 IIFE，Chromium 源码 BSD 许可）。

---

## 1. 碰撞系统

**Chrome** 采用两层检测：

1. **外层粗筛（AABB）**：
   - T-Rex：`(xPos+1, yPos+1, WIDTH-2, HEIGHT-2)` — 每边缩 1px 补偿 sprite 白边
   - 障碍物：`(xPos+1, yPos+1, width*size-2, height-2)`
   - 快速排除远距离物体

2. **内层精筛（Sub-boxes）**：
   - 外层重叠后，用多组 `CollisionBox` 做逐对检测
   - 任意一对 sub-box 重叠即判定碰撞

### T-Rex 奔跑态 sub-boxes（6 个）

| 偏移     | 尺寸  | 对应部位 |
| -------- | ----- | -------- |
| (22, 0)  | 17×16 | 头部     |
| (1, 18)  | 30×9  | 上背     |
| (1, 24)  | 29×5  | 身体中段 |
| (5, 30)  | 21×4  | 身体下段 |
| (9, 34)  | 15×4  | 脚       |
| (10, 35) | 14×8  | 腿       |

### T-Rex 蹲态 sub-boxes（1 个）

| 偏移    | 尺寸  |
| ------- | ----- |
| (1, 18) | 55×25 |

### 小仙人掌 sub-boxes（3 个）

| 偏移    | 尺寸 |
| ------- | ---- |
| (0, 7)  | 5×27 |
| (4, 0)  | 6×34 |
| (10, 4) | 7×14 |

### 大仙人掌 sub-boxes（3 个）

| 偏移     | 尺寸  |
| -------- | ----- |
| (0, 12)  | 7×38  |
| (8, 0)   | 7×49  |
| (13, 10) | 10×38 |

### 翼龙 sub-boxes（5 个）

| 偏移     | 尺寸 |
| -------- | ---- |
| (15, 15) | 16×5 |
| (18, 21) | 24×6 |
| (2, 14)  | 4×3  |
| (6, 10)  | 4×7  |
| (10, 8)  | 6×9  |

### Ciallo 现状

单层 AABB + 固定 padding：

```typescript
const p: Rect = { x: this.px + 4, y: this.py + 4, w: 36, h: 36 };
const q: Rect = { x: o.x + 2, y: o.y + 2, w: o.w - 4, h: o.h - 4 };
```

padding 各边不一致（恐龙左右不对等、上下缺角），导致约 5px 的不可碰撞死角。

**已实施**：方案 A（零 padding AABB）。详见 `docs/ciallo-enhancement-plan.md` 2.1 节。

### 借鉴方案

1. **方案 A（简单）**：零 padding，AABB 直接包视觉最大范围
   - `p = { x: px, y: py, w: 38, h: 44 }`，`q = { x: ox, y: oy, w: ow, h: oh }`
   - 碰撞盒略大于视觉（容忍少量误判）

2. **方案 B（精确）**：引入 sub-box 系统，根据 Canvas 绘图坐标逐部位定义碰撞矩形
   - 与 Chrome 一致的两层检测
   - 需要先定视觉外观，再反推 sub-box 坐标
   - 代码量增加，但精确度最高

---

## 2. 障碍物系统

### Chrome 的关键设计

#### 间隔公式

```javascript
minGap = Math.round(width * speed + minGap * gapCoefficient);
maxGap = Math.round(minGap * MAX_GAP_COEFFICIENT); // 1.5x
gap = getRandomNum(minGap, maxGap);
```

- **间隔随速度增大**——速度越快，障碍物间距越大，补偿操作难度
- `width * speed` 项使大尺寸 cactus 组自然留出更多空间
- `GAP_COEFFICIENT = 0.6`，`minGap = 120`（小/大 cactus 一致）

#### Ciallo 现状

```typescript
const base = 180 + Math.random() * 100;
return Math.max(base - this.speed * 10, 100);
```

- **间隔随速度减小**——速度越快越密集，双重惩罚玩家
- 没有按障碍物尺寸调整间隔
- 最小间隔 100px（速度 13 时约 128ms/障碍物，基本不可玩）

#### 障碍物组

Chrome 允许同一组出现 1–3 个 cactus（`size` 随机 1–3），视觉上并排：

```
____        ______        ________
_|   |-|    _|     |-|    _|       |-|
| |<->| |   | |<--->| |   | |<----->| |
| | 1 | |   | |  2  | |   | |   3   | |
|_|___|_|   |_|_____|_|   |_|_______|_|
```

碰撞盒自动适配组宽度：中间 sub-box 拉伸填补。

#### 障碍物池

| 类型         | 尺寸  | yPos        | 最低速度 | 说明                         |
| ------------ | ----- | ----------- | -------- | ---------------------------- |
| CACTUS_SMALL | 17×35 | 105         | 0        | 始终出现                     |
| CACTUS_LARGE | 25×50 | 90          | 0        | 始终出现                     |
| PTERODACTYL  | 46×40 | [100,75,50] | 8.5      | 速度达到后出现，3 个高度档位 |

- `multipleSpeed`：允许成组出现的最低速度（小 4，大 7，翼龙 999 即不成组）
- `minSpeed`：允许出现的最低速度（翼龙 8.5）
- 翼龙可变高度（桌面端 3 档，移动端 2 档）

### 借鉴建议

1. 间隔公式改为随速度增大：`minGap = width * speed + minGap * gapCoefficient`
2. 支持 cactus 成组出现（1–3 个）
3. 新增翼龙障碍物类型，速度 8.5 后引入
4. 障碍物数据从硬编码改为配置化

---

## 3. 跳跃与物理

### Chrome 的关键设计

```javascript
// 起跳
startJump: function (speed) {
    this.jumpVelocity = this.config.INIITAL_JUMP_VELOCITY - (speed / 10);
    // ≈ -10 - speed/10，速度越快跳得越低
    this.jumping = true;
    this.reachedMinHeight = false;
    this.speedDrop = false;
}

// 松开按键：降速下落
endJump: function () {
    if (this.reachedMinHeight && this.jumpVelocity < this.config.DROP_VELOCITY) {
        this.jumpVelocity = this.config.DROP_VELOCITY;
        // DROP_VELOCITY = -5（匀速减半）
    }
}

// 空中按 ↓：速降
setSpeedDrop: function () {
    this.speedDrop = true;
    this.jumpVelocity = 1;  // 立即转为下落
}

// 更新跳跃
updateJump: function (deltaTime, speed) {
    if (this.speedDrop) {
        this.yPos += jumpVelocity * SPEED_DROP_COEFFICIENT * framesElapsed;
        // SPEED_DROP_COEFFICIENT = 3，3 倍速下落
    } else {
        this.yPos += jumpVelocity * framesElapsed;
    }
    this.jumpVelocity += GRAVITY * framesElapsed;
}
```

物理计算公式：

```
framesElapsed = deltaTime / msPerFrame  (msPerFrame = 1000/60)
```

#### 关键常数

| 参数                   | 值  |
| ---------------------- | --- |
| GRAVITY                | 0.6 |
| INIITAL_JUMP_VELOCITY  | -10 |
| DROP_VELOCITY          | -5  |
| SPEED_DROP_COEFFICIENT | 3   |
| MIN_JUMP_HEIGHT        | 30  |
| MAX_JUMP_HEIGHT        | 30  |

注意 `MIN_JUMP_HEIGHT == MAX_JUMP_HEIGHT` 意味着「最小跳跃高度」和「最大跳跃高度」一致——Chrome 原版的跳法是通过松开按键触发 `endJump` 来实现「变矮」，不是真的「按越久跳越高」。但结合 `reachedMinHeight` 和 `speedDrop` 机制，手感上玩家仍然有「早松手→早落地」的控制感。

### Ciallo 现状

```typescript
const GRAVITY = 0.6;
const JUMP_VEL = -12;  // 固定，无速度调整

jump(): void {
    if (this.phase === "playing" && !this.jumping) {
        this.pv = JUMP_VEL;
        this.jumping = true;
    }
}

// update 中：
if (this.jumping) {
    this.py += this.pv;
    this.pv += GRAVITY;
    if (this.py >= GROUND_Y - 44) {
        this.py = GROUND_Y - 44;
        this.jumping = false;
        this.pv = 0;
    }
}
```

- 固定跳跃高度（约 120px/667ms）
- 无变高跳跃
- 无空中速降
- 无蹲下

### 借鉴建议

1. 初速度调整为 `-10 - speed/10`，速度越快跳得越矮
2. 引入 `endJump()`：松开空格时 `jumpVelocity = -5`（加速下落）
3. 引入空中 ↓ 速降：`SPEED_DROP_COEFFICIENT = 3`
4. 实现蹲下，切换碰撞盒为 lower profile

---

## 4. 速度与难度曲线

### Chrome

```javascript
this.distanceRan += (this.currentSpeed * deltaTime) / this.msPerFrame;

if (this.currentSpeed < this.config.MAX_SPEED) {
  this.currentSpeed += this.config.ACCELERATION; // 0.001
}
```

- 每帧加速，与 dt 无关
- `INVERT_DISTANCE = 700`：每跑 700 单位切换一次日夜模式
- 日夜模式用 CSS class `inverted` 切换，canvas 不额外处理

### Ciallo

```javascript
this.score += ((this.speed * dt) / 16.67) * 0.025;
if (this.speed < SPEED_MAX) this.speed += ACCEL * dt;
```

- 加速挂了 dt，与其他逻辑一致
- 无日夜模式

### 借鉴建议

- 距离/得分计算方式保持一致即可，无需大改
- 可考虑加入日夜模式作为视觉变体

---

## 5. 地面与地平线

### Chrome

- 两个 600px 地平线段循环滚动
- `HorizonLine.dimensions.YPOS = 127`
- 每次循环重新随机选择平/凹凸地面（`bumpThreshold = 0.5`）
- 12px 高的地面条纹

### Ciallo

- 一条线 + 4×4 方块每 20px 一个
- `GROUND_Y = 127`
- 无机凹凸变体

### 借鉴建议

- 加入地面凹凸随机变体，视觉更丰富

---

## 6. 总体架构对比

| 维度     | Chrome                              | Ciallo              |
| -------- | ----------------------------------- | ------------------- |
| 渲染     | 精灵图（spritesheet）               | Canvas 几何绘制     |
| 碰撞     | 两层：AABB + sub-boxes              | 单层 AABB + padding |
| 障碍物   | 3 类（小/大 cactus + 翼龙），可成组 | 2 种尺寸，单体      |
| 间隔     | 随速度增大                          | 随速度减小          |
| 跳跃     | 变高 + 速度调整 + 速降              | 固定高度            |
| 蹲下     | 完整实现 + 碰撞盒切换               | stub                |
| 日夜模式 | CSS class 切换                      | 无                  |
| 地形     | 凹凸随机变体                        | 固定                |
| 物理帧   | `framesElapsed = dt / msPerFrame`   | 直接用 dt           |

---

## 7. 实施状态

| 优先级 | 模块                            | 工作量 | 状态   |
| ------ | ------------------------------- | ------ | ------ |
| P0     | 碰撞盒调整                      | 小     | 已完成 |
| P1     | 跳跃手感（变高 + 速降 + ↓速降） | 中     | -      |
| P1     | 障碍物间隔改为随速度增大        | 中     | -      |
| P2     | 翼龙障碍物                      | 中     | -      |
| P2     | 蹲下 + 碰撞盒切换               | 中     | -      |
| P2     | cactus 成组                     | 中     | -      |
| P3     | 地面凹凸变体                    | 小     | -      |
| P3     | 日夜模式                        | 小     | -      |
