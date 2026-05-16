# Astro Paper v6 最小可用迁移清单

> 目标：先让站点在 v6 架构下 **可运行、可构建、可发布**，再逐步恢复个性化功能。

## 0. 前置准备

- 已创建升级分支（如：`chore/upgrade-astro-paper-v6`）
- 已将 v6 的 `src/` 同步到本地
- 当前改动先做一次基线提交，避免丢失现场

```bash
git add src
git commit -m "chore: import astro-paper v6 src baseline"
```

---

## 1. 最小保留策略（先跑通）

优先保留 v6 官方结构，先不要大范围“迁回旧实现”。

### 1.1 必保留（建议直接采用 v6）

- `src/layouts/*`
- `src/components/*`
- `src/pages/posts/*`（尤其 `[...slug]` 路由相关）
- `src/i18n/*`（v6 新增 i18n 结构）
- `src/styles/theme.css` 及 v6 样式体系
- `src/utils/*` 中 v6 新增工具

### 1.2 暂缓处理

- 旧版个性化 UI 微调
- 历史兼容写法（先不急于合并）

---

## 2. 必做人工迁移点

以下文件通常包含站点身份信息，需手动确认：

1. `src/config.ts`
   - 站点标题、描述、作者
   - 社交链接
   - SEO/OG 图配置

2. `src/content.config.ts`
   - 内容集合 schema 是否与现有文章 frontmatter 对齐

3. `src/pages/rss.xml.ts`
   - RSS 标题、描述、链接

4. `src/pages/og.png.ts` / `src/pages/posts/[...slug]/index.png.ts`
   - OG 生成逻辑与字体资源路径

5. `src/i18n/index.ts` 与 `src/i18n/lang/*`
   - 默认语言与文案是否符合现站点需求

---

## 3. 内容目录清理（按需）

v6 会带一些演示文章，可按需删除：

- `src/content/posts/_releases/*`
- `src/content/posts/examples/*`
- 其他模板示例文章（如 `how-to-*`, `adding-new-post.mdx` 等）

> 原则：保留你自己的文章；模板示例可以先删，避免污染生产内容。

---

## 4. 构建前检查

### 4.1 结构检查

- 是否存在重复路由（例如旧 `posts` 分页路由与 v6 新路由冲突）
- 是否存在引用已删除组件/工具函数
- 是否有旧路径引用（特别是 `styles`、`utils`）

### 4.2 快速定位命令

```bash
git status
pnpm lint
pnpm build
```

---

## 5. 验证流程（必须执行）

按项目约定顺序执行：

```bash
pnpm format && pnpm lint && pnpm build
```

若失败：

- 先修 `lint` 与类型错误
- 再次执行三连命令，直到全部通过

---

## 6. 建议提交切分

为便于回滚与评审，建议拆分 commit：

1. `chore: import astro-paper v6 src baseline`
2. `refactor: migrate site config to v6`
3. `refactor: align content schema and i18n`
4. `chore: cleanup template posts`
5. `fix: pass format lint build`

---

## 7. 完成定义（DoD）

满足以下条件即认为“最小可用迁移完成”：

- [ ] 首页、文章页、标签页、归档页可正常访问
- [ ] RSS 与 OG 生成正常
- [ ] 自有文章可被正确索引与渲染
- [ ] `pnpm format && pnpm lint && pnpm build` 全通过
- [ ] 升级分支有清晰的分步提交记录

---

## 8. 后续优化（非阻塞）

- 恢复/重做个性化样式
- 优化新组件文案与交互
- 增补迁移回归检查清单（SEO、性能、可访问性）
