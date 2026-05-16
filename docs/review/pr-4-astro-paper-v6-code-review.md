# PR #4 代码审查：chore/upgrade-astro-paper-v6

- 审查范围：仅限 PR #4 的 19 个提交
- 提交范围：`c591ebb^..7979cc0`
- PR 合并提交：`1da88b7 Merge pull request #4 from 0xnayuta/chore/upgrade-astro-paper-v6`
- 审查日期：2026-05-16
- 验证命令：`pnpm format && pnpm lint && pnpm build`（通过）

## 总结

本次 PR 完成了 Astro Paper v6 迁移、内容集合迁移，以及部分旧站功能/样式恢复。整体可以构建通过，类型检查和 ESLint 未发现阻塞问题。

主要建议集中在以下方面：

1. 动态 OG 图片配置仍保留但对应路由已删除，打开配置后会产生失效 URL。
2. 文章详情页客户端脚本缺少幂等处理，在 Astro View Transitions 下容易重复插入 DOM/绑定事件。
3. 文章标题锚点逻辑在 `TableOfContents` 和文章详情页脚本中重复实现，可能产生重复锚点和目录文本污染。
4. 部分链接未使用 Astro 的 base/i18n 路径工具，后续如果配置 `base` 或多语言会失效。
5. 首页一言模块默认内容依赖 JS 才可见，不利于无 JS/脚本失败时的渐进增强。

## 发现的问题与修改建议

### P1：动态 OG 图片开关仍存在，但生成路由已删除

**相关文件**

- `src/config.ts`
- `src/utils/resolveDefaultOgImagePath.ts`
- `src/pages/posts/[...slug]/index.astro`
- 已删除：`src/pages/og.png.ts`
- 已删除：`src/pages/posts/[...slug]/index.png.ts`

**问题**

PR 删除了站点级和文章级动态 OG 图片路由，但配置层仍保留并默认启用：

- `config.features.dynamicOgImage` 默认值仍为 `true`。
- `resolveDefaultOgImagePath()` 在动态 OG 启用且默认图片不存在时会回退到 `og.png`。
- 文章详情页在动态 OG 启用时会生成 `${postUrl}/index.png`。

当前站点配置中显式设置了 `dynamicOgImage: false`，所以构建不会暴露该问题。但如果后续删除该显式配置、复用默认值，或用户重新开启该功能，页面会输出不存在的 OG 图片 URL，影响社交平台预览和 SEO。

**建议**

二选一：

1. 如果 v6 迁移后暂不支持动态 OG：
   - 将 `src/config.ts` 中 `dynamicOgImage` 默认值改为 `false`。
   - 在类型注释/文档中标注该功能当前不可用。
   - 删除或改写 `resolveDefaultOgImagePath()` 中回退到 `/og.png` 的逻辑。
2. 如果仍要保留该功能：
   - 恢复 `src/pages/og.png.ts` 和 `src/pages/posts/[...slug]/index.png.ts`。
   - 确认 `@resvg/resvg-js`、字体加载和 OG 模板在 Astro v6 下仍可构建与运行。

---

### P1：文章详情页客户端脚本在页面切换后可能重复插入进度条与重复绑定事件

**相关文件**

- `src/pages/posts/[...slug]/index.astro`
- `src/components/TableOfContents.astro`

**问题**

文章详情页底部脚本使用了 `is:inline data-astro-rerun`，每次 Astro 客户端导航进入文章页都会重新执行：

- `createProgressBar()` 每次都会向 `document.body` 追加新的 `.progress-container`。
- `updateScrollProgress()` 每次都会新增一个 `scroll` 监听器。
- `attachCopyButtons()` 每次执行都会重新包装 `pre`，并追加复制按钮；如果在同一 DOM 生命周期内重复执行，可能出现嵌套 wrapper 或多个按钮。
- `TableOfContents.astro` 的 `initTOC()` 在 `astro:after-swap` 后也会重新绑定 `window.scroll` 和 `list.click` 事件，但没有清理旧监听器。

这些问题在静态构建阶段不会报错，但在启用 `ClientRouter` 的客户端页面切换中可能造成重复 DOM、重复事件、滚动性能下降或 UI 异常。

**建议**

- 为进度条创建增加幂等判断，例如先检查 `document.querySelector('.progress-container')`。
- 将滚动监听器提取为具名函数，并在重新初始化前移除旧监听器，或使用 `AbortController` 统一取消。
- 为代码块复制按钮增加标记，例如 `pre.dataset.copyButtonReady = 'true'`，避免重复初始化。
- `TableOfContents` 初始化前清理旧监听器，或将滚动监听绑定在组件生命周期/单例控制器中。

---

### P2：文章标题锚点逻辑重复，可能产生重复 `#` 链接和目录文本污染

**相关文件**

- `src/pages/posts/[...slug]/index.astro`
- `src/components/TableOfContents.astro`

**问题**

目前有两处代码会为标题追加 `.heading-link`：

1. `TableOfContents.astro` 的 `addHeadingLinks()` 会处理 `#article h2-h6`。
2. `src/pages/posts/[...slug]/index.astro` 底部脚本的 `addHeadingLinks()` 会处理页面上所有 `h2-h6`，且没有判断标题内是否已经存在 `.heading-link`。

可能后果：

- 文章标题内出现两个锚点链接。
- 第二段脚本会处理非文章区域标题，例如目录标题“目录”。
- 目录生成文本时使用 `innerText`，如果标题内已有可见的 `#`，目录项文本可能被追加 `#`。

**建议**

- 只保留一个标题锚点实现，优先放在 `TableOfContents.astro` 或单独的客户端工具中。
- 如果继续保留文章页脚本，至少限制选择器为 `#article h2, #article h3, ...`，并增加：
  - `if (heading.querySelector('.heading-link')) return;`
  - 使用 `aria-label` 和 `aria-hidden`，避免辅助技术重复朗读。
- 生成目录文本时建议读取标题的纯文本节点，排除 `.heading-link` 内容。

---

### P2：Footer 的 About 链接未适配 Astro base 和 i18n 路径

**相关文件**

- `src/components/Footer.astro`

**问题**

Footer 中 About 链接写死为：

```astro
<a href="/about" class="hover:underline">
```

当前生产站点部署在根路径且仅配置 `zh` 单语言，因此暂时可用。但项目其他位置已经普遍使用 `getRelativeLocaleUrl()`。如果后续配置 `base`，或扩展多语言路由，该链接会绕过 Astro 的路径生成规则。

**建议**

改为与 Header 等组件一致的写法：

```astro
---
import { getRelativeLocaleUrl } from "astro:i18n";
const locale = Astro.currentLocale ?? config.site.lang;
---

<a href={getRelativeLocaleUrl(locale, "about")} class="hover:underline">
```

---

### P2：首页一言默认内容在 JS 失败或禁用时不可见

**相关文件**

- `src/pages/index.astro`

**问题**

首页已经在 HTML 中提供了默认一言内容，但 CSS 将其设置为透明：

```css
.hitokoto .hitokoto-text {
  opacity: 0;
}

.hitokoto .hitokoto-from {
  opacity: 0;
}
```

只有客户端脚本执行并添加 `.fade-in` 后内容才会显示。如果用户禁用 JS、脚本执行失败，或者在极端网络/浏览器环境下脚本未运行，默认内容会一直不可见。

**建议**

- 默认保持内容可见，只对更新时的内容执行动画。
- 可改为：默认 `opacity: 1`，在脚本执行更新前临时添加动画类。
- 或在 HTML 上添加 `data-enhanced` 类，由 JS 成功初始化后再启用动画样式。

---

### P3：日期是否修改的判断建议统一转为时间戳比较

**相关文件**

- `src/components/Datetime.astro`

**问题**

当前代码：

```ts
const isModified = modDatetime && modDatetime > pubDatetime;
```

集合 schema 中日期会被解析为 `Date`，当前情况下可工作。但组件 Props 类型允许 `string | Date`，如果未来调用方传入字符串，字符串和 Date 混合比较可能得到不符合预期的结果。

**建议**

统一使用 `dayjs` 或 `Date` 时间戳比较：

```ts
const pubTime = dayjs(pubDatetime);
const modTime = modDatetime ? dayjs(modDatetime) : null;
const isModified = !!modTime && modTime.valueOf() > pubTime.valueOf();
const datetime = (isModified ? modTime : pubTime).tz(
  postTimezone ?? config.site.timezone,
);
```

这样组件对 `string | Date` 的 Props 声明更稳健。

## 非阻塞观察

- `pnpm format && pnpm lint && pnpm build` 已通过，说明迁移后的基础类型、路由生成和生产构建没有阻塞问题。
- 内容集合迁移后的 19 篇文章、标签页、归档页均能生成。
- 社交图标已迁移到 `src/assets/icons/socials/`，当前 `github` 和 `mail` 配置能正常匹配。
- `resolveDefaultOgImagePath()` 对 `site.ogImage` 做了路径穿越防护，这是一个正向改进。

## 建议优先级

1. 优先处理 P1 动态 OG 配置与已删除路由不一致问题。
2. 优先处理 P1/P2 客户端脚本幂等问题，避免客户端导航后出现重复 UI 或性能退化。
3. 随后修复 Footer 路径、Hitokoto 渐进增强和日期比较的稳健性问题。
