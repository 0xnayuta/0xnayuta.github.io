# Astro Paper v6 P1 功能回溯对照表

> 状态：✅ 已完成

> 目的:用于在 v6 架构下逐步找回升级前的核心自定义功能。
> 范围:仅覆盖 P1 高风险文件(功能影响面最大)。
> 状态:✅ 已完成 P1 全项目回溯。

---

## P1 对照表(最终状态)

| #   | 旧文件(升级前)                           | 新版落点(v6)                                                                               | 恢复状态    | 恢复说明                                                            |
| --- | ---------------------------------------- | ------------------------------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------- |
| 1   | `src/config.ts`                          | `astro-paper.config.ts`(主配置) + `src/config.ts`(resolved 层)                             | ✅ 已恢复   | 站点 url 改为 `https://www.wangyan.life`;其余已收敛                 |
| 2   | `src/i18n/index.ts`                      | `src/i18n/index.ts` + `src/i18n/lang/zh.ts`                                                | ✅ 已恢复   | 新增 `zh.ts`,补全中文翻译(nav/pagination/pages/post/a11y)           |
| 3   | `src/components/Breadcrumb.astro`        | `src/components/Breadcrumb.astro`                                                          | ✅ 已恢复   | 已回退分隔符为旧版 `&gt;`（`>`）                                    |
| 4   | `src/components/Footer.astro`            | `src/components/Footer.astro`                                                              | ✅ 已恢复   | 恢复站点标题链接 + 备案号外链                                       |
| 5   | `src/components/Pagination.astro`        | `src/components/Pagination.astro`                                                          | ⏭ 跳过     | v6 版本已满足,保持新架构                                            |
| 6   | `src/components/Card.astro`              | `src/components/Card.astro` + `src/utils/extractExcerpt.ts`                                | ✅ 已恢复   | 恢复摘要兜底逻辑 + TruncateText 截断                                |
| 7   | `src/pages/index.astro`                  | `src/pages/index.astro`                                                                    | ✅ 已恢复   | 恢复一言模块与旧站样式（粗体引言、小号出处、`——` 前缀、图标社交区） |
| 8   | `src/pages/search.astro`                 | `src/pages/search.astro`                                                                   | ⏭ 跳过     | v6 版本已满足,保持新架构                                            |
| 9   | `src/pages/archives/index.astro`         | `src/pages/archives/index.astro` + `src/pages/archives/_utils/getPostsByGroupCondition.ts` | ⏭ 跳过     | v6 版本已优于旧版,无需改动                                          |
| 10  | `src/layouts/Layout.astro`               | `src/layouts/Layout.astro`                                                                 | ✅ 已恢复   | 迁移前已移除 Font 与 `PUBLIC_GOOGLE_SITE_VERIFICATION`              |
| 11  | `src/pages/og.png.ts`                    | 已移除                                                                                     | ⛔ 明确放弃 | 关闭 dynamic OG,稳定性优先                                          |
| 12  | `src/pages/posts/[...slug]/index.png.ts` | 已移除                                                                                     | ⛔ 明确放弃 | 同上                                                                |

---

## 恢复统计

| 状态             | 数量 |
| ---------------- | ---- |
| ✅ 已恢复        | 7    |
| ⏭ 跳过(v6 满足) | 3    |
| ⛔ 明确放弃      | 2    |

---

## 每项恢复的操作记录(供参考)

```bash
# ✅ astro-paper.config.ts
git add astro-paper.config.ts
git commit -m "chore: align site url to production domain"

# ✅ src/i18n/lang/zh.ts
git add src/i18n/lang/zh.ts
git commit -m "feat(i18n): add zh locale strings for v6 migration"

# ✅ src/components/Footer.astro
git add src/components/Footer.astro
git commit -m "feat(footer): restore about link and icp record on v6"

# ✅ src/components/Card.astro
git add src/components/Card.astro
git commit -m "feat(card): restore excerpt fallback and truncation on v6"

# ✅ src/pages/index.astro
git add src/pages/index.astro
git commit -m "feat(index): restore hitokoto module with cache on v6"
```

---

## 当前状态

- 分支:`chore/upgrade-astro-paper-v6`
- 构建:✅ `pnpm format && pnpm lint && pnpm build` 通过
- 动态 OG:❌ 已关闭,无恢复计划
- 迁移进度：P1/P2/P3 执行结果已归档（见 `docs/astro-paper-v6-p2-p3-restore-mapping.md`）

---

## 下一步

- 做最终人工回归检查（首页一言、about、RSS、标签分页、footer 链接）
- 推送分支并发起 PR
