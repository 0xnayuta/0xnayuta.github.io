# Breadcrumb 分页文案 i18n 标准化方案

## 背景

当前面包屑在文章列表与标签分页场景中，会出现不符合中文语境的分页文案，例如：

```text
主页 > 文章 (page 1)
主页 > 文章 (page 2)
```

期望中文显示为：

```text
主页 > 文章（第 1 页）
主页 > 文章（第 2 页）
```

同时，当前实现存在两个结构性问题：

1. `zh.ts` 中 `pagination.page` 仍为英文 `Page`，导致中文页面出现英文分页词。
2. `Breadcrumb.astro` 对 `/posts/*` 的判断过宽，可能把文章详情页误判为分页页。

因此，本次应采用更标准的 i18n 方案，并同步统一 posts 与 tags 的分页显示逻辑。

## 目标

- 使用 i18n 定义分页文案格式，避免在组件中硬编码 `page` 拼接。
- 中文使用符合中文排版习惯的全角括号与“第 N 页”。
- 英文继续保持自然英文格式，如 `Posts (page 2)`。
- 精准区分文章列表分页、标签分页与普通详情页。
- 同步处理 posts 与 tags 的分页面包屑，避免同类问题残留。
- 保持 Astro Paper v6 当前架构，不回退旧实现。

## 非目标

- 不在本次修改中把文章详情页 slug 替换为文章标题。
- 不调整面包屑视觉样式。
- 不调整分页组件 `Pagination.astro` 的按钮文案或布局。
- 不修改路由结构。

## 当前问题分析

### 1. 中文分页文案不完整

当前 `src/i18n/lang/zh.ts`：

```ts
pagination: {
  prev: "上一页",
  next: "下一页",
  page: "Page",
}
```

`page` 字段被 `Breadcrumb.astro` 直接拼接：

```ts
`${t.nav.posts} (${t.pagination.page.toLowerCase()} ${breadcrumbList[1] || 1})`
```

因此中文页面会显示英文 `page`。

### 2. posts 分支识别过宽

当前逻辑：

```ts
if (breadcrumbList[0] === "posts") {
  breadcrumbList.splice(
    0,
    2,
    `${t.nav.posts} (${t.pagination.page.toLowerCase()} ${breadcrumbList[1] || 1})`
  );
}
```

它会把所有 `/posts/*` 都当作分页路径处理，包括文章详情页：

```text
/posts/example-slug/
```

潜在错误结果：

```text
主页 > 文章 (page example-slug)
```

### 3. tags 分页也存在同类问题

当前 tags 分支同样使用：

```ts
t.pagination.page.toLowerCase()
```

因此标签分页在中文环境下也会出现英文分页词，应该同步统一。

## 设计方案

采用更标准的 i18n 方案：在 `pagination` 中新增分页格式化函数。

### 1. 扩展 i18n 类型

修改 `src/i18n/types.ts`：

```ts
pagination: {
  prev: string;
  next: string;
  page: string;
  pageLabel: (page: number) => string;
};
```

保留现有 `page` 字段，避免影响其他可能使用方；新增 `pageLabel` 专门用于格式化“第 N 页 / page N”。

### 2. 更新英文文案

修改 `src/i18n/lang/en.ts`：

```ts
pagination: {
  prev: "Prev",
  next: "Next",
  page: "Page",
  pageLabel: page => `page ${page}`,
},
```

英文面包屑最终格式：

```text
Home > Posts (page 1)
Home > Posts (page 2)
Home > Tags > TypeScript (page 2)
```

### 3. 更新中文文案

修改 `src/i18n/lang/zh.ts`：

```ts
pagination: {
  prev: "上一页",
  next: "下一页",
  page: "页",
  pageLabel: page => `第 ${page} 页`,
},
```

中文面包屑最终格式：

```text
主页 > 文章（第 1 页）
主页 > 文章（第 2 页）
主页 > 标签 > TypeScript（第 2 页）
```

### 4. Breadcrumb 内增加格式化辅助函数

在 `src/components/Breadcrumb.astro` 中增加两个辅助函数：

```ts
const isNumeric = (value: string | undefined) =>
  value !== undefined && !isNaN(Number(value));

const formatPagedLabel = (label: string, page: number) =>
  locale.startsWith("zh")
    ? `${label}（${t.pagination.pageLabel(page)}）`
    : `${label} (${t.pagination.pageLabel(page)})`;
```

职责划分：

- `pageLabel` 负责语言文案：`第 2 页` / `page 2`
- `formatPagedLabel` 负责外层括号排版：中文全角括号 / 英文半角括号

## posts 面包屑规则

### 路由：`/posts/`

```text
主页 > 文章（第 1 页）
```

英文：

```text
Home > Posts (page 1)
```

### 路由：`/posts/2/`

```text
主页 > 文章（第 2 页）
```

英文：

```text
Home > Posts (page 2)
```

### 路由：`/posts/example-slug/`

保持普通层级，不再误判为分页：

```text
主页 > 文章 > example-slug
```

英文：

```text
Home > Posts > example-slug
```

## tags 面包屑规则

### 路由：`/tags/`

```text
主页 > 标签
```

### 路由：`/tags/example-tag/`

```text
主页 > 标签 > example-tag
```

### 路由：`/tags/example-tag/2/`

中文：

```text
主页 > 标签 > example-tag（第 2 页）
```

英文：

```text
Home > Tags > example-tag (page 2)
```

### 标签第一页是否显示页码

当前实现中，tags 分支对第一页有特殊处理：

```ts
Number(breadcrumbList[2]) === 1 ? "" : ...
```

建议继续保留这个行为：

- `/tags/example-tag/` 显示 `example-tag`
- `/tags/example-tag/1/` 也显示 `example-tag`
- `/tags/example-tag/2/` 才显示 `example-tag（第 2 页）`

这样能避免标签第一页显示冗余分页信息。

posts 列表则建议保留用户当前明确提出的格式：

- `/posts/` 显示 `文章（第 1 页）`
- `/posts/2/` 显示 `文章（第 2 页）`

## 计划改动文件

### 1. `src/i18n/types.ts`

- 在 `pagination` 中新增：

```ts
pageLabel: (page: number) => string;
```

### 2. `src/i18n/lang/en.ts`

- 新增：

```ts
pageLabel: page => `page ${page}`,
```

### 3. `src/i18n/lang/zh.ts`

- 将 `page` 从 `"Page"` 调整为更合理的中文基础词，例如 `"页"`。
- 新增：

```ts
pageLabel: page => `第 ${page} 页`,
```

### 4. `src/components/Breadcrumb.astro`

- 新增 `isNumeric` 辅助函数。
- 新增 `formatPagedLabel` 辅助函数。
- 重写 posts 分支：
  - `/posts/` → `文章（第 1 页）`
  - `/posts/2/` → `文章（第 2 页）`
  - `/posts/[slug]/` 不进入分页逻辑
- 重写 tags 分支：
  - 使用 `t.pagination.pageLabel(page)`
  - 使用中英文对应括号
  - 保留第一页不额外显示页码的行为

## 建议实现步骤

1. 修改 i18n 类型与中英文语言包。
2. 修改 `Breadcrumb.astro` 内分页判断逻辑。
3. 运行验证：

```bash
pnpm format && pnpm lint && pnpm build
```

4. 手动检查以下页面：

```text
/posts/
/posts/2/
/posts/example-slug/
/tags/
/tags/example-tag/
/tags/example-tag/2/
```

## 风险与注意事项

- `pagination.pageLabel` 是函数，所有语言包都必须同步补齐，否则 TypeScript 会报错。
- `Breadcrumb.astro` 当前是基于 URL segment 推导，不读取页面标题；文章详情页仍会显示 slug，这是本次非目标。
- 中文括号由 `Breadcrumb.astro` 的格式化函数控制，不放进语言包中，避免语言包同时承担文案和排版职责。
- 如果未来新增更多语言，可以继续通过 `pageLabel` 定义语言内的页码语序。

## 推荐结论

采用该方案可以同时解决：

- 中文出现英文 `page` 的问题。
- 中文分页格式不符合排版习惯的问题。
- posts 文章详情页可能被误判为分页的问题。
- tags 分页同类文案不统一的问题。

该方案改动范围清晰，符合当前 v6 架构，也便于后续继续扩展 i18n。
