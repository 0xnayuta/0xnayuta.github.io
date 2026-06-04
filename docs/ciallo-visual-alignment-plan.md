# Ciallo 游戏视觉对齐方案

## 目标

将 `ciallo-game.ts` 的 Canvas 几何绘制替换为 Chrome T-Rex Runner 的精灵图（`drawImage`），同时保留当前 `GameColors` 主题色注入系统。

参考：`../t-rex-runner/`（Chromium 源码 BSD 许可提取版），`docs/ciallo-trex-reference-analysis.md`。

---

## 一、方案选择（已确认）

**采用方案 A（精灵图）**，放弃方案 B（高保真 Canvas 重绘）。

理由：
- 像素级还原 Chrome 原版外观
- 自动获得所有动画帧（奔跑 2 帧/眨眼/碰撞/蹲下 2 帧/翼龙拍翅 2 帧）
- 绘制代码大幅简化（`drawImage` 一行代替多行几何）
- 碰撞 sub-box 直接从 Chrome 源码抄，无需反推

---

## 二、逐对象对齐差异

### 2.1 小恐龙（T-Rex）

| 维度 | Chrome 精灵 | Ciallo 当前 |
|---|---|---|
| 尺寸 | 44×47，6 组动画帧 | ~38×42，无帧 |
| 身体 | 像素精灵，有机曲线 | 两个叠加椭圆 + 三角尾巴 |
| 腿 | 像素脚，有脚趾 | `fillRect(7×6)`，两帧摆动 |
| 手臂 | 像素小短手 | `fillRect(4×6)`，已接近 |
| 眼睛 | 白色眼眶 + 黑色瞳孔 | 白色圆形 + 黑色小圆，已接近 |
| 嘴巴 | 碰撞时张嘴 | 碰撞时白色半弧，已实现 |

**处理**：直接替换为精灵帧。删除全部几何绘制代码。

### 2.2 仙人掌

| 维度 | Chrome 精灵 | Ciallo 当前 |
|---|---|---|
| 尺寸 | 小 17×35，大 25×50，可成组 1–3 | 同左，无成组 |
| 形状 | 像素 | `fillRect` + `arc` + 尖刺 |
| 效果 | — | 已相当接近 |

**处理**：替换为精灵图。可成组（`size` 属性 1–3，自动拉伸中间 sub-box）。

### 2.3 云朵

| 维度 | Chrome 精灵 | Ciallo 当前 |
|---|---|---|
| 尺寸 | 46×14 | `roundRect(w, 12, 6)` |
| 形状 | 像素云朵轮廓 | 扁平圆角矩形 |

**处理**：替换为精灵图。保持随机间距逻辑。

### 2.4 地面 / 地平线

| 维度 | Chrome 精灵 | Ciallo 当前 |
|---|---|---|
| 位置 | Y=127，12px 高 | 同左 |
| 纹理 | 像素地面条纹，有凹凸变体 | 线 + 4×4 方块 |
| 滚动 | 双 600px 段循环 | `groundX` 模 20px |

**处理**：替换为精灵图。实现双段滚动 + 凹凸随机。

### 2.5 翼龙（新对象）

Chrome 定义：46×40，3 个高度档位（桌面 y: 100/75/50），2 帧拍翅动画，最低速度 8.5 出现。

**处理**：新增 `drawPterodactyl()` / `Pterodactyl` 类，用精灵帧 + `Obstacle` 逻辑。

---

## 三、实施方案

### 3.1 精灵图资源

| 文件 | 来源 | 目标路径 |
|---|---|---|
| `200-offline-sprite.png` | `../t-rex-runner/assets/default_200_percent/` | `src/assets/ciallo/sprite.png` |

仅保留 2x 版。复制时保留 BSD 版权声明。

`drawImage` 时 source 坐标和尺寸全部翻倍（与 Chrome HDPI 分支一致），target 坐标和尺寸使用精灵的逻辑尺寸（1x 值），不分 HiDPI/LoDPI 检测。

### 3.2 精灵图坐标映射

2x 精灵图下，所有 source 坐标乘以 2，target 使用逻辑尺寸。

T-Rex 基础位置（1x 逻辑值，实际 2x source 需乘以 2）：

```
TREX.x = 848（1x），TREX.y = 2（1x）
```

T-Rex 各帧 sourceX 偏移（Chrome 的 `Trex.animFrames` + `TREX.x`，2x 版均翻倍）：

| 状态 | 帧偏移 (1x) | sourceX 公式 |
|---|---|---|
| WAITING frame 0 | 44 | (848 + 44) * 2 |
| WAITING frame 1 (blink) | 0 | (848 + 0) * 2 |
| RUNNING frame 0 | 88 | (848 + 88) * 2 |
| RUNNING frame 1 | 132 | (848 + 132) * 2 |
| JUMPING | 0 | (848 + 0) * 2 |
| CRASHED | 220 | (848 + 220) * 2 |
| DUCKING frame 0 | 264 | (848 + 264) * 2, W=118 |
| DUCKING frame 1 | 323 | (848 + 323) * 2, W=118 |

其他对象 sourceX/sourceY/sourceW/sourceH 通用公式：

```
sourceX = spriteDefinition.x * 2 + (frameOffset * 2)
sourceY = spriteDefinition.y * 2
sourceW = logicalWidth * 2
sourceH = logicalHeight * 2
```

| 对象 | 逻辑尺寸 | spritePos (1x) | 帧偏移 |
|---|---|---|---|
| CACTUS_SMALL | 17×35 | (228, 2) | size 变化 ` (sourceW * size) * 0.5 * (size - 1)` |
| CACTUS_LARGE | 25×50 | (332, 2) | 同上 |
| CLOUD | 46×14 | (86, 2) | 无 |
| PTERODACTYL | 46×40 | (134, 2) | 两帧，每帧 `frame * 46` |
| HORIZON | 600×12 | (2, 54) | 双段，凹凸变体 |

target 坐标：`drawImage(sprite, sourceX, sourceY, sourceW, sourceH, targetX, targetY, logicalWidth, logicalHeight)`

### 3.3 主题色保留方案

当前 `GameColors` 接口保持不动。精灵图着色通过 Canvas 合成实现：

```
1. 将精灵帧绘制到离屏 Canvas
2. ctx.globalCompositeOperation = 'source-atop'
3. ctx.fillStyle = this.colors.fg（或其他对应色）
4. ctx.fillRect(覆盖整个帧区域)
5. 将离屏 Canvas 的 tinted 结果 drawImage 到主画布
```

或在游戏初始化时预计算多套色板的 tinted 帧缓存，运行时按主题切换。具体方案待实施时根据性能表现决定（预计算 vs 运行时合成）。

### 3.4 碰撞盒

视觉定型后，将 Chrome 的 sub-box 数据直接迁移（已在 `ciallo-trex-reference-analysis.md` 中记录）：

- `Trex.collisionBoxes.RUNNING`：6 个 sub-box（头/背/身/腿/脚）
- `Trex.collisionBoxes.DUCKING`：1 个 sub-box
- `CACTUS_SMALL.collisionBoxes`：3 个 sub-box
- `CACTUS_LARGE.collisionBoxes`：3 个 sub-box
- `PTERODACTYL.collisionBoxes`：5 个 sub-box

当前 P0 零 padding AABB 保留不变，精灵图迁移后替换为 sub-box 方案。

### 3.5 实施顺序

```
1. 复制精灵图资源 + 图片加载逻辑
2. 替换 drawDino() 为精灵帧
3. 替换 drawCactus() 为精灵帧 + 成组逻辑
4. 替换 drawCloud() 为精灵帧
5. 替换地面绘制为精灵图 + 双段循环
6. 新增翼龙障碍物
7. 迁移碰撞盒为 sub-box 方案
8. 清理已删除的几何绘制常量
```

### 3.6 后续计划

P1（跳跃手感/速降/蹲下）在视觉定稿后分批实施，不做入本阶段。

---

## 四、对已实施的 P0 碰撞盒调整的影响

P0 零 padding AABB 是临时方案。精灵图迁移后，碰撞盒将升级为 Chrome 的 sub-box 两层检测系统——零 padding 的方向不变，精度更高。当前 P0 代码在 3.5 第 7 步时替换。

---

## 五、已确认决策

| 决策 | 结论 |
|---|---|
| 方案选择 | **方案 A（精灵图）** |
| 精灵图版本 | **仅 2x（200-offline-sprite.png）**，source 坐标翻倍 |
| 主题色控制 | **保留 `GameColors`**，通过 Canvas 合成着色 |
| 许可证 | 精灵图来自 Chromium BSD 许可，复制时保留版权声明 |
| P1 时机 | **视觉定稿后分批做**，不混入本阶段 |
| 碰撞盒 | 本阶段第 7 步升级为 Chrome sub-box 方案 |
