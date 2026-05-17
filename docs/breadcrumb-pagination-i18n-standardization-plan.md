# Breadcrumb 分页文案 i18n 标准化方案

> 状态：✅ 已完成

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

- 使用 i18n 定义分页文案与分页标签格式，避免在组件中硬编码 `page` 拼接与中英文括号规则。
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
`${t.nav.posts} (${t.pagination.page.toLowerCase()} ${breadcrumbList[1] || 1})`;
```

因此中文页面会显示英文 `page`。

### 2. posts 分支识别过宽

当前逻辑：

```ts
if (breadcrumbList[0] === "posts") {
  breadcrumbList.splice(
    0,
    2,
    `${t.nav.posts} (${t.pagination.page.toLowerCase()} ${breadcrumbList[1] || 1})`,
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
t.pagination.page.toLowerCase();
```

因此标签分页在中文环境下也会出现英文分页词，应该同步统一。

## 设计方案

采用更彻底的 i18n 方案：在 `pagination` 中新增两个格式化函数。

- `pageLabel(page)`：只负责页码短语，例如 `第 2 页` / `page 2`。
- `pagedLabel(label, page)`：负责完整分页标签，例如 `文章（第 2 页）` / `Posts (page 2)`。

这样可以把语言文案、语序、括号样式全部收敛到语言包中，避免 `Breadcrumb.astro` 中出现 `locale.startsWith("zh")` 之类的语言特判。

### 1. 扩展 i18n 类型

修改 `src/i18n/types.ts`：

```ts
pagination: {
  prev: string;
  next: string;
  page: string;
  pageLabel: (page: number) => string;
  pagedLabel: (label: string, page: number) => string;
}
```

说明：

- 保留现有 `page` 字段，避免破坏已有字段结构。
- `page` 可作为基础词保留，例如英文 `Page`、中文 `页`。
- 实际分页格式化优先使用 `pageLabel` / `pagedLabel`。

### 2. 更新英文文案

修改 `src/i18n/lang/en.ts`：

```ts
pagination: {
  prev: "Prev",
  next: "Next",
  page: "Page",
  pageLabel: page => `page ${page}`,
  pagedLabel: (label, page) => `${label} (page ${page})`,
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
  pagedLabel: (label, page) => `${label}（第 ${page} 页）`,
},
```

中文面包屑最终格式：

```text
主页 > 文章（第 1 页）
主页 > 文章（第 2 页）
主页 > 标签 > TypeScript（第 2 页）
```

## Breadcrumb 逻辑设计

### 1. 使用严格页码判断

不建议继续使用：

```ts
!isNaN(Number(value));
```

因为它会把 `0`、`-1`、`2.5`、`Infinity` 等不符合分页语义的 segment 也判定为数字。

建议新增严格的正整数判断：

```ts
const isPositiveIntegerSegment = (value: string | undefined) =>
  typeof value === "string" && /^[1-9]\d*$/.test(value);
```

只有 `1`、`2`、`10` 这类正整数 segment 会被视为分页页码。

### 2. posts 分支只处理分页路由

posts 分支应明确只处理两种情况：

```ts
if (breadcrumbList[0] === "posts") {
  if (breadcrumbList.length === 1) {
    breadcrumbList.splice(0, 1, t.pagination.pagedLabel(t.nav.posts, 1));
  } else if (
    breadcrumbList.length === 2 &&
    isPositiveIntegerSegment(breadcrumbList[1])
  ) {
    breadcrumbList.splice(
      0,
      2,
      t.pagination.pagedLabel(t.nav.posts, Number(breadcrumbList[1])),
    );
  }
}
```

这样可以避免文章详情页被误判为分页。

### 3. tags 分支只处理标签分页路由

tags 分支应严格限定为：

```text
/tags/[tag]/[page]/
```

建议逻辑：

```ts
if (
  breadcrumbList[0] === "tags" &&
  breadcrumbList.length === 3 &&
  isPositiveIntegerSegment(breadcrumbList[2])
) {
  const tagName = decodeSegment(breadcrumbList[1]);
  const page = Number(breadcrumbList[2]);

  breadcrumbList.splice(
    1,
    2,
    page === 1 ? tagName : t.pagination.pagedLabel(tagName, page),
  );
}
```

注意：这里应使用 `splice(1, 2, ...)`，因为只需要替换 `[tag]` 与 `[page]` 两段；不建议继续使用语义不准确的 `splice(1, 3, ...)`。

## posts 面包屑规则

### 路由：`/posts/`

中文：

```text
主页 > 文章（第 1 页）
```

英文：

```text
Home > Posts (page 1)
```

### 路由：`/posts/2/`

中文：

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

建议继续保留该行为：

- `/tags/example-tag/` 显示 `example-tag`
- 如果未来或异常情况下出现 `/tags/example-tag/1/`，也按第一页处理，显示 `example-tag`
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
pagedLabel: (label: string, page: number) => string;
```

### 2. `src/i18n/lang/en.ts`

- 新增：

```ts
pageLabel: page => `page ${page}`,
pagedLabel: (label, page) => `${label} (page ${page})`,
```

### 3. `src/i18n/lang/zh.ts`

- 将 `page` 从 `"Page"` 调整为更合理的中文基础词，例如 `"页"`。
- 新增：

```ts
pageLabel: page => `第 ${page} 页`,
pagedLabel: (label, page) => `${label}（第 ${page} 页）`,
```

### 4. `src/components/Breadcrumb.astro`

- 新增 `isPositiveIntegerSegment` 辅助函数。
- 删除基于 `t.pagination.page.toLowerCase()` 的分页拼接。
- 重写 posts 分支：
  - `/posts/` → `文章（第 1 页）`
  - `/posts/2/` → `文章（第 2 页）`
  - `/posts/[slug]/` 不进入分页逻辑
- 重写 tags 分支：
  - 只处理 `/tags/[tag]/[page]/`
  - 使用 `t.pagination.pagedLabel(tagName, page)`
  - 保留第一页不额外显示页码的行为
  - 使用 `splice(1, 2, ...)` 替换 `[tag]` 与 `[page]` 两段

## 建议实现步骤

1. 修改 i18n 类型与中英文语言包。
2. 修改 `Breadcrumb.astro` 内分页判断逻辑。
3. 搜索确认不再存在旧拼接用法：

```bash
rg "pagination\.page|toLowerCase\(\)" src/components/Breadcrumb.astro src/i18n
```

4. 运行验证：

```bash
pnpm format && pnpm lint && pnpm build
```

5. 手动检查以下页面：

```text
/posts/
/posts/2/
/posts/example-slug/
/tags/
/tags/example-tag/
/tags/example-tag/2/
```

说明：`/tags/example-tag/1/` 可作为理论兼容场景，不一定由当前 Astro paginate 实际生成。

## 风险与注意事项

- `pagination.pageLabel` 与 `pagination.pagedLabel` 是函数，所有语言包都必须同步补齐，否则 TypeScript 会报错。
- `Breadcrumb.astro` 当前是基于 URL segment 推导，不读取页面标题；文章详情页仍会显示 slug，这是本次非目标。
- 括号样式属于语言/地区排版习惯，本方案将其放入 `pagedLabel`，避免组件内出现中文特判。
- `pagination.page` 暂时保留是为了兼容已有字段结构；实际分页格式化优先使用 `pageLabel` / `pagedLabel`。
- 如果未来新增更多语言，可以继续通过 `pageLabel` 与 `pagedLabel` 定义语言内的页码语序和排版格式。

## 推荐结论

采用该方案可以同时解决：

- 中文出现英文 `page` 的问题。
- 中文分页格式不符合排版习惯的问题。
- posts 文章详情页可能被误判为分页的问题。
- tags 分页同类文案不统一的问题。
- 组件内硬编码中英文括号规则的问题。

该方案改动范围清晰，符合当前 v6 架构，也便于后续继续扩展 i18n。
