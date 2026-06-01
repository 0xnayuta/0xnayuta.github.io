# Astro Paper v6 最小可用迁移清单（正式版复核）

> 状态：✅ 已完成（2026-06-01）  
> 适用场景：此前已在 v6 dev 分支完成迁移，现对上游 `v6.0.0` 正式版进行最小成本复核。

---

## 0. 背景

本仓库在 v6 正式发布前已完成迁移与回溯，历史文档：

- `docs/astro-paper-v6-minimal-migration-checklist.md`
- `docs/astro-paper-v6-p1-restore-mapping.md`
- `docs/astro-paper-v6-p2-p3-restore-mapping.md`
- `docs/astro-paper-v6-style-minimal-diff-fix-checklist.md`

本轮目标不是重做迁移，而是确认正式版与既有迁移结果是否存在关键偏差。

---

## 1. 本轮策略（执行结果）

- [x] 采用策略 A：若正式版差异不影响当前站点功能，保持现状，仅补充记录。
- [x] 不进行代码改动，仅更新迁移文档与复核结论。

---

## 2. 复核 Checklist（已执行）

## 2.1 上游版本差异复核

- [x] 确认上游 release 为 `satnaing/astro-paper v6.0.0`
- [x] 对照此前 dev 迁移基线进行差异审查
- [x] 结论：正式版关键变更（配置统一、content loader、i18n、base 路由）均已被当前仓库吸收

## 2.2 既有迁移文档一致性检查

- [x] `P1` 回溯项复核完成
- [x] `P2/P3` 跳过项复核完成（“v6 已满足”结论仍成立）
- [x] 样式最小差异清单复核完成
- [x] 修正文档偏差：将“动态 OG 已放弃”更新为“当前实际启用”

## 2.3 运行与构建最小验收

- [x] 已执行并通过：

```bash
pnpm format && pnpm lint && pnpm build
```

- [x] 抽检路由：首页、文章页、标签页、归档页、搜索页、RSS、OG 图片路由

## 2.4 字体裁剪触发检查

- [x] 本轮仅变更 `docs/**`，未命中字体裁剪触发范围，无需执行 `node scripts/subset-fonts.js`

---

## 3. 最终结论

- [x] 本轮无需代码层升级补丁
- [x] 当前可维持现状进入 PR 审核
- [x] 已新增复核结论记录：`docs/astro-paper-v6-release-recheck-report.md`

---

## 4. 备注

构建过程中存在非阻塞 deprecation 提示（Astro markdown 插件配置写法），不影响本轮结论；建议后续作为技术债处理。
