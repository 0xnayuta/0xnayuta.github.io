# Astro Paper v6 样式对齐：逐文件最小差异修复清单

> 状态：✅ 已完成（并于 2026-06-01 完成 v6.0.0 正式版复核）

> 目的：在保持 v6 架构的前提下，按最小改动逐步收敛与 `main` 分支的视觉差异。  
> 原则：一次只改 1 个文件（最多 1~3 处 class），每步都可回退、可验证。

---

## 执行顺序（归档）

1. `src/components/Breadcrumb.astro`
2. `src/components/Footer.astro`
3. `src/components/Socials.astro`
4. `src/components/Tag.astro`
5. `src/pages/search.astro`
6. `src/pages/archives/index.astro`
7. `src/pages/404.astro`

> 说明：`src/pages/index.astro`（一言/社交文案）与 `src/pages/posts/[...slug]/index.astro`（TOC 侧栏）属于“有意偏离 main 的定制项”，不纳入本轮“对齐 main”清单。

---

## 逐文件完成情况

## 1) `src/components/Breadcrumb.astro`

- [x] 对齐外层容器间距：`mt-8 mb-1` 与 `app-layout` 组合
- [x] 对齐层级文字透明度：中间层级 `opacity-70`、当前层级 `opacity-75`
- [x] 保持分隔符为 `>`（按旧站确认）

## 2) `src/components/Footer.astro`

- [x] 对齐顶部边线实现（`border-t` 风格）
- [x] 对齐 footer 主体纵向/横向间距（`py-6 / sm:py-4`）
- [x] 对齐版权行文字与链接排列方式

## 3) `src/components/Socials.astro`

- [x] 对齐图标容器排布（方向、换行策略）
- [x] 对齐图标间距（gap）
- [x] 对齐图标 hover/opacity 行为

## 4) `src/components/Tag.astro`

- [x] 对齐标签字号（sm/default）
- [x] 对齐标签间距与外边距
- [x] 对齐边框/透明度/hover 样式

## 5) `src/pages/search.astro`

- [x] 对齐搜索输入框与标题间距
- [x] 对齐结果列表项间距与文本层级
- [x] 对齐空结果态文案区域留白

## 6) `src/pages/archives/index.astro`

- [x] 对齐年份分组标题间距
- [x] 对齐列表项行距/时间文本样式
- [x] 对齐分组之间垂直留白

## 7) `src/pages/404.astro`

- [x] 对齐主标题与说明文字间距
- [x] 对齐返回按钮样式与位置
- [x] 对齐整体垂直居中/留白策略

---

## 验证结论

- 历史执行阶段与本次正式版复核均通过：

```bash
pnpm format && pnpm lint && pnpm build
```

- 当前结论：样式对齐清单已完成，且与 v6.0.0 正式版状态一致。
