# Astro Paper v6 P2/P3 功能回溯对照表（执行结果）

> 目的：记录 P2/P3 阶段的恢复决策与执行结果。  
> 原则：优先保持 v6 新架构，不做不必要的向后兼容。

---

## 执行结果总览

| 状态                 | 数量 |
| -------------------- | ---- |
| ✅ 已恢复            | 1    |
| ⏭ 跳过（v6 已满足） | 13   |
| ➕ 额外清理项        | 1    |

---

## P2 执行结果

| 项  | 文件                         | 结果    | 说明                                                       |
| --- | ---------------------------- | ------- | ---------------------------------------------------------- |
| P2  | `src/content.config.ts`      | ⏭ 跳过 | 差异审查通过；现有 frontmatter 与 schema 兼容，无需改动。  |
| P2  | `src/utils/slugify.ts`       | ⏭ 跳过 | 与旧站核心规则一致（Latin/non-Latin 混合策略），无需改动。 |
| P2  | `src/components/Tag.astro`   | ⏭ 跳过 | 仅视觉差异；功能正常，保留 v6 实现。                       |
| P2  | `src/utils/getUniqueTags.ts` | ⏭ 跳过 | 去重/排序/slug 逻辑满足需求，保留 v6。                     |
| P2  | `src/styles/global.css`      | ⏭ 跳过 | v6 结构更清晰（theme.css + utility），不回退旧样式组织。   |
| P2  | `src/styles/typography.css`  | ⏭ 跳过 | 当前排版满足需求；不做旧版样式回灌。                       |
| P2  | `src/pages/tags/index.astro` | ⏭ 跳过 | 现有文案与行为满足。                                       |
| P2  | `src/pages/404.astro`        | ⏭ 跳过 | 当前文案体系已由 i18n 覆盖。                               |

---

## P3 执行结果

| 项  | 文件                                   | 结果      | 说明                                                       |
| --- | -------------------------------------- | --------- | ---------------------------------------------------------- |
| P3  | `src/utils/getSortedPosts.ts`          | ⏭ 跳过   | 与旧逻辑一致（`modDatetime ?? pubDatetime` 倒序）。        |
| P3  | `src/utils/postFilter.ts`              | ⏭ 跳过   | 与旧逻辑一致（draft + scheduled margin + DEV 例外）。      |
| P3  | `src/pages/tags/[tag]/[...page].astro` | ⏭ 跳过   | 分页与过滤行为符合预期。                                   |
| P3  | `src/pages/posts/[...page].astro`      | ⏭ 跳过   | 分页与 backUrl 行为正常。                                  |
| P3  | `src/pages/rss.xml.ts`                 | ⏭ 跳过   | 标题/描述/site/link 生成符合当前配置。                     |
| P3  | `src/components/Datetime.astro`        | ✅ 已恢复 | 恢复中文日期观感：`zh*` 显示 `YYYY-M-D`，其他语言保留 v6。 |
| P3  | `src/components/Header.astro`          | ⏭ 跳过   | v6 在 i18n、base/locale 兼容、a11y 上更优。                |
| P3  | `src/components/Socials.astro`         | ⏭ 跳过   | 与 `astro-paper.config.ts` 配置式设计一致。                |
| P3  | `src/components/LinkButton.astro`      | ⏭ 跳过   | v6 类型与语义更标准，无需回退。                            |

---

## 额外清理项（计划外但已执行）

| 项    | 文件范围               | 结果      | 说明                                                       |
| ----- | ---------------------- | --------- | ---------------------------------------------------------- |
| Extra | `src/content/posts/**` | ➕ 已完成 | 移除所有 frontmatter `slug` 字段（当前路由不依赖该字段）。 |

---

## 验证状态

所有相关改动均已反复通过：

```bash
pnpm format && pnpm lint && pnpm build
```

---

## 当前结论

- P2/P3 以“少改动、保新架构”为主，绝大多数项经审查后选择跳过。
- 唯一必要恢复项为 `Datetime` 中文日期观感。
- 文档与代码状态一致，可进入最终回归检查/PR 阶段。
