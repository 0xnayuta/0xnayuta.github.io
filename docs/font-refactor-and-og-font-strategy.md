# 字体改造计划与 OG 字体策略

> 状态：✅ 已完成

## 背景与目标

当前项目已恢复动态 OG 生成能力（`/og.png` 与 `/posts/**/index.png`），并使用 Astro v6 官方方案（`satori + sharp + astro fonts`）。

下一步目标：

1. 支持分别自定义：
   - 中文/英文正文字体（当前阶段先使用同一套字体）
   - 代码（等宽）字体
2. 对 OG 字体做到：
   - **逻辑上解耦**（不与全局字体配置硬绑定）
   - **视觉上可一致**（默认可与正文保持统一风格）
3. 保持可维护性与构建稳定性。

---

## OG 是什么？

OG（Open Graph）是网页给社交平台提供的分享元信息标准，常见字段包括：

- `og:title`
- `og:description`
- `og:image`

本项目的动态 OG 路由用于生成分享图：

- 站点级：`src/pages/og.png.ts`
- 文章级：`src/pages/posts/[...slug]/index.png.ts`

---

## 总体改造方案

### 1) 字体变量分层（语义化）

建议引入以下语义变量：

- `--font-sans-zh`：中文正文
- `--font-sans-en`：英文正文
- `--font-mono`：代码与等宽场景
- `--font-og`：动态 OG 专用
- `--font-app`：全局正文组合变量

当前已选定字体文件：

- 中文 + 英文正文：`src/assets/fonts/msyh.woff2`
- 代码等宽：`src/assets/fonts/CascadiaCode.woff2`

建议关系：

- `--font-app` 组合中英字体及 fallback
- `--font-og` 默认可与 `--font-app` 主字体一致（保证视觉统一）

### 2) 配置层（Astro Fonts）

在 `astro.config.mjs` 的 `fonts` 中注册多套字体，并分别绑定 CSS 变量。

- 保留当前已生效的官方模式（`fontProviders` + `fonts`）
- 新增/替换到上述语义变量

### 3) 样式层分离正文与代码

- `body` 继续走 `font-app`
- `code, pre, kbd, samp, .astro-code` 显式走 `font-mono`

避免代码字体被正文继承导致可读性下降。

### 4) OG 路由解耦

动态 OG 路由不再读取正文变量，而读取 `--font-og` 对应的 `fontData`：

- `src/pages/og.png.ts`
- `src/pages/posts/[...slug]/index.png.ts`

这样后续更换网站正文/代码字体时，不会误伤 OG。

---

## 分阶段实施计划

### Phase 1：结构就位（切换到已准备字体）

1. 在 `astro.config.mjs` 增加语义化字体变量映射
2. 在 `src/styles/theme.css` 中声明 `--font-app` / `--font-mono`
3. 将 `msyh.woff2` 绑定到 `--font-sans-zh` 与 `--font-sans-en`（当前阶段中英同款）
4. 将 `CascadiaCode.woff2` 绑定到 `--font-mono`

**验收**：构建通过，正文与代码字体均切换到目标字体。

### Phase 2：代码字体独立生效

1. 在 `src/styles/typography.css` 为代码元素显式指定 `font-family: var(--font-mono)`
2. 验证代码块等宽对齐与可读性

**验收**：代码区域字体与正文可明显区分。

### Phase 3：OG 字体解耦

1. OG 路由读取 `--font-og`
2. 默认将 `--font-og` 指向与正文接近的风格（视觉一致）

**验收**：`/og.png` 与 `/posts/**/index.png` 正常生成，字体可单独配置。

### Phase 4：中英文字体精细化（可选）

1. 先用 `font-family` fallback 链实现中英兼容
2. 需要时再引入 `:lang(zh)` / `:lang(en)` 精细控制

**验收**：中英混排质量提升且不影响现有内容。

---

## 字体静态化建议

## 结论

字体文件可以静态化，且推荐静态化（自托管）以提升可控性和稳定性。

### 推荐方式

- 优先使用本地自托管字体（`woff2`）
- 避免运行时依赖外部字体服务可用性
- 与构建产物一起发布，降低跨区域访问波动

### 技术建议

- 格式优先级：`woff2` > 其他
- 常用字重：`400 / 500 / 700`
- `font-display: swap`
- 后续可做子集化（尤其中文）

---

## 本项目当前字体选型（已确定）

### 中文正文（Sans-zh）

- 使用：`msyh.woff2`
- 路径：`src/assets/fonts/msyh.woff2`

### 英文正文（Sans-en）

- 使用：`msyh.woff2`（当前阶段与中文共用）
- 路径：`src/assets/fonts/msyh.woff2`

### 代码等宽（Mono）

- 使用：`CascadiaCode.woff2`
- 路径：`src/assets/fonts/CascadiaCode.woff2`

### OG 字体

- 策略：逻辑解耦（独立变量 `--font-og`），视觉可一致（初始指向 msyh）
- 建议：先与正文一致，确保品牌统一；后续如需强调可读性，再单独替换 OG 字体

> OG 首要目标是“分享卡片缩略图可读性”，其次才是风格个性。

---

## 文件级改造清单（实施时参考）

- `astro.config.mjs`
  - 扩展 `fonts` 配置，加入 `--font-sans-zh` / `--font-sans-en` / `--font-mono` / `--font-og`
  - 将 `msyh.woff2` 映射到 `--font-sans-zh`、`--font-sans-en`、`--font-og`
  - 将 `CascadiaCode.woff2` 映射到 `--font-mono`
- `src/styles/theme.css`
  - 定义 `--font-app` 与 `--font-mono` 的语义映射
- `src/styles/typography.css`
  - 显式指定代码元素字体为 `--font-mono`
- `src/layouts/Layout.astro`
  - 保持 `<Font ... />` 注入与变量一致
- `src/pages/og.png.ts`
  - 字体数据读取切换到 `--font-og`
- `src/pages/posts/[...slug]/index.png.ts`
  - 字体数据读取切换到 `--font-og`

---

## 验证清单

每次修改后执行：

```bash
pnpm format && pnpm lint && pnpm build
```

重点验证：

1. 构建成功，无字体相关报错
2. `dist/og.png` 可生成
3. `dist/posts/**/index.png` 可生成
4. 正文与代码字体区分正常
5. 页面 `og:image` / `twitter:image` 指向正确

---

## 当前状态备注

- 动态 OG 已恢复并可构建
- 当前方案已接入官方 v6 字体链路
- 后续可在不影响动态 OG 的前提下进行字体体系升级
