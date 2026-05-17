# [青枫江上](https://www.wangyan.life)

个人博客网站，记录我的兴趣与学习笔记。

## 开发与发布流程（必须走 PR 合并）

本仓库采用双工作流：

- `PR Checks (Font Subset + Build)`：仅在 PR 到 `main` 时运行
- `Deploy to GitHub Pages`：仅在 `main` 分支 push 后运行部署

因此请遵循以下流程：

1. 从 `main` 拉新分支开发
2. 本地修改后执行：

   ```bash
   pnpm format && pnpm lint && pnpm build
   ```

3. 若改动包含以下任一项，必须先执行字体裁剪并提交产物：
   - `src/assets/fonts/raw/**`
   - `src/content/**/*.md`
   - `src/i18n/lang/**/*.ts`
   - `astro-paper.config.ts`

   ```bash
   node scripts/subset-fonts.js
   ```

4. 提交分支并发起 PR 到 `main`
5. 等待 `PR Checks (Font Subset + Build)` 通过后再合并
6. 合并到 `main` 后由 CI 自动部署

> 注意：若 PR 中触发字体裁剪条件，但未提交最新 `src/assets/fonts/*.ttf`，CI 会失败并要求先在本地运行裁剪脚本后提交。
