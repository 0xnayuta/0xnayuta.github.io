# `src/vendors/sakana` 当前架构与维护约定

本目录是对 `dsrkafuu/sakana-widget` 的**本地定制实现**（vendor code），用于适配当前 Astro 项目（含 `ClientRouter` 路由切换场景）。

> 目标：稳定、可维护、可控，不追求与 upstream 逐文件同步。

---

## 1. 目录结构

- `index.ts`：核心小组件逻辑（生命周期、动画、交互、挂载/卸载）
- `index.css`：组件样式（由 `src/components/Sakana.astro` 静态导入）
- `characters/`：角色图片与默认角色状态
- `icons/`：控制条 SVG 资源（通过 `?raw` 导入）
- `LICENSE`：上游 MIT 许可证

---

## 2. 当前架构约定

1. **CSS 必须由 Astro 静态导入，不允许在 `index.ts` 内动态导入**
   - 原因：避免路由切换时样式丢失导致 DOM 显示异常。

2. **由 `src/components/Sakana.astro` 统一管理生命周期**
   - 路由事件绑定、挂载时机、防重入逻辑都在组件层控制。
   - `vendors/sakana` 只负责 widget 本身能力。

3. **不提供 `autoFit` API**
   - 当前实现固定尺寸，避免与过渡/布局瞬态冲突。

4. **支持销毁重建（mount/unmount 可重入）**
   - 切页时可安全 unmount，下一页可稳定 mount。

5. **图标资源统一使用 `?raw` 导入 SVG 字符串**
   - 避免 `[object Object]` 渲染问题。

6. **本目录已纳入项目质量门禁**
   - 不再通过 ESLint ignore 或 TypeScript exclude 跳过检查。

7. **`hide()` 表示进入折叠态，而不是完全移除 UI**
   - 折叠态会隐藏人物与 canvas 竖条，但保留底部控制条作为恢复入口。
   - `saveState: true` 时折叠状态会持久化。
   - 折叠态下禁用人物切换与自动模式按钮，仅保留 GitHub 链接与展开按钮可交互。

8. **控制条文案由项目 i18n 注入**
   - `src/components/Sakana.astro` 从当前 locale 读取 `t.sakana`，并通过 DOM `data-*` 属性传给客户端脚本。
   - `vendors/sakana` 通过 `labels` options 接收文案并保留英文 fallback，但不直接依赖项目 i18n。

---

## 3. 折叠态设计

当前实现将“小组件关闭”定义为**折叠态**，而不是传统意义上的完全卸载或 `display: none`。

### 3.1 设计目标

- 避免额外引入与 Sakana 控制条风格不一致的外部恢复按钮。
- 保留一个稳定、可发现的恢复入口。
- 让关闭/恢复行为仍属于 Sakana widget 自身交互，而不是页面组件层的额外逻辑。
- 在 Astro `ClientRouter` 路由切换后保持行为稳定。

### 3.2 视觉表现

展开态显示：

- 人物图片
- canvas 竖条
- 底部控制条

折叠态仅显示：

- 底部控制条

折叠态通过 `.sakana-widget-wrapper--collapsed` 控制样式：

- 隐藏 `.sakana-widget-img`
- 隐藏 `.sakana-widget-canvas`
- 保留 `.sakana-widget-ctrl`

### 3.3 交互策略

折叠态下仅保留必要交互：

| 控制项        | 展开态       | 折叠态       |
| ------------- | ------------ | ------------ |
| 人物切换      | 可用         | 禁用         |
| 自动模式      | 可用         | 禁用         |
| GitHub 链接   | 可用         | 可用         |
| 收起/展开按钮 | 显示收起图标 | 显示展开图标 |

折叠时会停止动画与自动模式，避免隐藏状态下继续执行不可见动画。

### 3.4 状态持久化

当 `saveState: true` 时，`stateKey` 对应的 localStorage 值只使用 JSON snapshot 格式。

持久化内容包括：

- 展开/折叠状态
- 当前角色
- 当前物理状态（`i/s/d/r/y/t/w`）

不会持久化：

- 自动模式是否开启
- RAF / timeout 等运行时句柄
- 拖拽中的临时事件监听器

保存时机包括：

- 折叠 / 展开时
- 切换角色时
- 拖拽结束时
- Astro `ClientRouter` 站内跳转前
- 页面刷新、关闭或离开时（`pagehide`）

读取时如果遇到非法 JSON、版本不匹配、字段缺失或角色不存在的数据，会忽略该数据并回退到角色默认初始状态。

### 3.5 文案来源

控制条文案纳入项目 i18n：

- `src/i18n/types.ts` 定义 `sakana` 文案结构。
- `src/i18n/lang/*.ts` 提供各语言文案。
- `src/components/Sakana.astro` 根据当前 locale 读取 `t.sakana`，通过 DOM `data-*` 属性传给客户端脚本。
- `src/vendors/sakana/index.ts` 通过 `labels` options 接收文案，且只保留英文 fallback，不直接 import 项目 i18n。

### 3.6 职责边界

- `src/components/Sakana.astro` 只负责挂载、路由生命周期、位置配置与 i18n 注入。
- `src/vendors/sakana/index.ts` 负责折叠状态、控制条交互、动画暂停/恢复与状态持久化。
- `src/vendors/sakana/index.css` 负责折叠态视觉样式。

---

## 4. 维护边界（推荐）

- 可调整：
  - 默认物理参数（`r/i/d` 等）
  - 控制条是否显示
  - 交互策略（拖拽、自动模式）
  - 可访问性属性
- 尽量不改：
  - 公开 API 形状（`mount/unmount/setState/...`）
  - 容器与路由生命周期职责边界（组件层 vs vendor 层）

---

## 5. 升级策略

如果未来要吸收 upstream 变更，建议：

1. 先在独立分支对比差异，不直接覆盖本目录。
2. 仅挑选必要变更（bugfix/性能）手工迁移。
3. 迁移后必须回归验证：

```bash
pnpm format && pnpm lint && pnpm build
```

并重点手测：

- 首次加载
- 多次站内跳转
- 移动端显示
- 关闭/恢复状态

---

## 6. 许可与素材说明

- 上游代码许可证：MIT（见本目录 `LICENSE`）
- 默认角色图片来自上游资源，存在**非商业使用限制**说明。
- 若存在商业化可能，请替换为自有角色素材。
