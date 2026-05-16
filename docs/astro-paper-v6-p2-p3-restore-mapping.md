# Astro Paper v6 P2/P3 功能回溯对照表

> 目的：记录非核心但高频影响体验的自定义恢复项（P2 + P3）。  
> 说明：本表用于后续逐项恢复，不立即执行。

## 使用建议

- 按 **P2 -> P3** 顺序处理。
- 每次只恢复 1~2 项，完成后执行：

```bash
pnpm format && pnpm lint && pnpm build
```

- 恢复策略：优先“迁移行为”，避免“回退旧实现”。

---

## P2 对照项

| 优先级 | 旧文件（升级前）             | 新版落点（v6）               | 恢复建议                                                                         |
| ------ | ---------------------------- | ---------------------------- | -------------------------------------------------------------------------------- |
| P2     | `src/utils/slugify.ts`       | `src/utils/slugify.ts`       | 恢复 slug 规则（中文/符号处理）时，确保与标签路由一致，避免生成历史链接断裂。    |
| P2     | `src/styles/typography.css`  | `src/styles/typography.css`  | 恢复文章排版细节（标题、引用、代码块、表格）时逐段回迁，防止覆盖 v6 token。      |
| P2     | `src/styles/global.css`      | `src/styles/global.css`      | 恢复全局视觉样式（间距、字体、颜色变量）时优先改变量层，不直接大面积覆盖选择器。 |
| P2     | `src/pages/tags/index.astro` | `src/pages/tags/index.astro` | 恢复标签页文案/排序/UI；保留 v6 路由与分页机制。                                 |
| P2     | `src/pages/404.astro`        | `src/pages/404.astro`        | 恢复 404 文案与按钮行为；检查多语言文案来源。                                    |
| P2     | `src/content.config.ts`      | `src/content.config.ts`      | 如旧 frontmatter 有自定义字段，按 v6 schema 增量补齐（可选字段优先）。           |
| P2     | `src/components/Tag.astro`   | `src/components/Tag.astro`   | 恢复标签样式或交互（hover/title），确保与 slugify 规则一致。                     |

---

## P3 对照项

| 优先级 | 旧文件（升级前）                           | 新版落点（v6）                                           | 恢复建议                                                               |
| ------ | ------------------------------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------- |
| P3     | `src/utils/transformers/fileName.js`       | `src/utils/transformers/fileName.js`                     | 仅在代码块文件名展示有差异时恢复；避免破坏 Shiki transformer 链。      |
| P3     | `src/utils/postFilter.ts`                  | `src/utils/postFilter.ts`                                | 恢复文章筛选边界条件（草稿、定时发布容差）时同步验证归档/首页/RSS。    |
| P3     | `src/utils/getUniqueTags.ts`               | `src/utils/getUniqueTags.ts`                             | 恢复标签去重与排序策略，注意与 slug 化后结果一致。                     |
| P3     | `src/utils/getSortedPosts.ts`              | `src/utils/getSortedPosts.ts`                            | 恢复排序优先级（发布时间/更新时间/置顶）并验证分页稳定性。             |
| P3     | `src/scripts/theme.ts`                     | `src/scripts/theme.ts`                                   | 恢复主题切换细节（存储键、系统跟随）并检查闪烁问题。                   |
| P3     | `src/pages/tags/[tag]/[...page].astro`     | `src/pages/tags/[tag]/[...page].astro`                   | 恢复标签分页页文案与空状态展示。                                       |
| P3     | `src/pages/rss.xml.ts`                     | `src/pages/rss.xml.ts`                                   | 恢复 RSS 描述、排序、过滤策略；重点验证链接是否全站可访问。            |
| P3     | `src/pages/posts/[...slug]/index.astro`    | `src/pages/posts/[...slug]/index.astro`                  | 恢复文章页细节（meta、附加模块、版权信息）时保持 v6 组件边界。         |
| P3     | `src/components/Socials.astro`             | `src/components/Socials.astro` + `astro-paper.config.ts` | 社交入口优先在配置层恢复，组件层仅处理展示。                           |
| P3     | `src/components/Header.astro`              | `src/components/Header.astro`                            | 恢复导航项、移动端菜单细节与主题按钮行为。                             |
| P3     | `src/components/Datetime.astro`            | `src/components/Datetime.astro`                          | 恢复日期格式偏好（本地化、时区显示）并与 `config.site.timezone` 对齐。 |
| P3     | `src/pages/posts/[...page].astro`          | `src/pages/posts/[...page].astro`                        | 恢复文章列表分页页文案、标题模板、空状态。                             |
| P3     | `src/components/LinkButton.astro`          | `src/components/LinkButton.astro`                        | 恢复按钮视觉与无障碍属性。                                             |
| P3     | `src/assets/icons/IconHash.svg`            | 同路径                                                   | 仅在视觉风格不一致时恢复。                                             |
| P3     | `src/assets/icons/IconEdit.svg`            | 同路径                                                   | 同上。                                                                 |
| P3     | `src/assets/icons/IconChevronLeft.svg`     | 同路径                                                   | 同上。                                                                 |
| P3     | `src/assets/icons/IconArrowNarrowUp.svg`   | 同路径                                                   | 同上。                                                                 |
| P3     | `src/assets/images/AstroPaper-v3.png`      | 同路径                                                   | 示例资源，按需保留或删除。                                             |
| P3     | `src/assets/images/AstroPaper-v4.png`      | 同路径                                                   | 示例资源，按需保留或删除。                                             |
| P3     | `src/assets/images/AstroPaper-v5.png`      | 同路径                                                   | 示例资源，按需保留或删除。                                             |
| P3     | `src/assets/images/forrest-gump-quote.png` | 同路径                                                   | 示例资源，按需保留或删除。                                             |

---

## 推荐执行顺序（P2/P3）

1. `content.config.ts`（字段兼容）
2. `slugify.ts` + `Tag.astro` + `getUniqueTags.ts`
3. `getSortedPosts.ts` + `postFilter.ts`
4. `global.css` + `typography.css`
5. `Header.astro` + `Socials.astro` + `LinkButton.astro`
6. `tags/index.astro` + `tags/[tag]/[...page].astro` + `posts/[...page].astro`
7. `rss.xml.ts` + `Datetime.astro`
8. 资源文件（icons/images）按需处理

---

## 记录模板（执行时使用）

- 功能项：
- 旧提交：
- 修改文件：
- 恢复方式（迁移/重写/放弃）：
- 验证结果（format/lint/build）：
- 备注：
