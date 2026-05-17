# Astro Paper v6 样式对齐：逐文件最小差异修复清单

> 状态：✅ 已完成

> 目的：在保持 v6 架构的前提下，按最小改动逐步收敛与 `main` 分支的视觉差异。  
> 原则：一次只改 1 个文件（最多 1~3 处 class），每步都可回退、可验证。

---

## 执行顺序（建议）

1. `src/components/Breadcrumb.astro`
2. `src/components/Footer.astro`
3. `src/components/Socials.astro`
4. `src/components/Tag.astro`
5. `src/pages/search.astro`
6. `src/pages/archives/index.astro`
7. `src/pages/404.astro`

> 说明：`src/pages/index.astro`（一言/社交文案）与 `src/pages/posts/[...slug]/index.astro`（TOC 侧栏）属于“有意偏离 main 的定制项”，不纳入本轮“对齐 main”清单。

---

## 逐文件最小差异修复清单

## 1) `src/components/Breadcrumb.astro`

- [ ] 对齐外层容器间距：`mt-8 mb-1` 与 `app-layout` 组合
- [ ] 对齐层级文字透明度：中间层级 `opacity-70`、当前层级 `opacity-75`
- [ ] 保持分隔符为 `>`（已按旧站确认）

**验收点**

- 面包屑与正文上边距、下边距视觉与 `main` 一致
- “主页 > 子页” 的层级对比与 `main` 接近

---

## 2) `src/components/Footer.astro`

- [ ] 对齐顶部边线实现（`border-t` 风格）
- [ ] 对齐 footer 主体的纵向/横向间距（`py-6 / sm:py-4`）
- [ ] 对齐版权行文字与链接排列方式

**验收点**

- Footer 与正文分隔线样式一致
- 桌面端/移动端布局切换与 `main` 一致

---

## 3) `src/components/Socials.astro`

- [ ] 对齐图标容器排布（方向、换行策略）
- [ ] 对齐图标间距（gap）
- [ ] 对齐图标 hover/opacity 行为

**验收点**

- Footer 与首页社交图标间距观感一致
- hover 反馈与 `main` 接近

---

## 4) `src/components/Tag.astro`

- [ ] 对齐标签字号（sm/default）
- [ ] 对齐标签间距与外边距
- [ ] 对齐边框/透明度/hover 样式

**验收点**

- 文章页标签行密度与 `main` 一致
- 标签在深浅色主题下可读性一致

---

## 5) `src/pages/search.astro`

- [ ] 对齐搜索输入框与标题的间距
- [ ] 对齐结果列表项间距与文本层级
- [ ] 对齐空结果态文案区域的留白

**验收点**

- 搜索页首屏节奏（标题→输入框→结果）与 `main` 一致

---

## 6) `src/pages/archives/index.astro`

- [ ] 对齐年份分组标题间距
- [ ] 对齐列表项行距/时间文本样式
- [ ] 对齐分组之间的垂直留白

**验收点**

- 归档页信息密度与 `main` 一致

---

## 7) `src/pages/404.astro`

- [ ] 对齐主标题与说明文字间距
- [ ] 对齐返回按钮样式与位置
- [ ] 对齐整体垂直居中/留白策略

**验收点**

- 404 页视觉重心与 `main` 一致

---

## 每步验证命令

每完成 1 个文件，执行：

```bash
pnpm format && pnpm lint && pnpm build
```

---

## 变更记录模板（建议）

- 文件：
- 对齐目标（参照 main）：
- 最小改动点（1~3 处 class）：
- 验证结果（format/lint/build）：
- 备注（是否保留定制差异）：
