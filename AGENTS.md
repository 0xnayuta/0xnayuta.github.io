# 开发流程

## 代码修改后的验证流程

每次修改代码后，按以下顺序执行：

```bash
pnpm format && pnpm lint && pnpm build
```

### 流程说明

| 步骤 | 命令          | 说明                           |
| ---- | ------------- | ------------------------------ |
| 1    | `pnpm format` | 格式化代码（自动修复格式问题） |
| 2    | `pnpm lint`   | 检查代码规范并修复问题         |
| 3    | `pnpm build`  | 类型检查 + 构建生产版本        |

## 开发预览

```bash
pnpm dev   # 启动开发服务器
pnpm build && pnpm preview  # 构建后预览
```

## 提交流程约束（必须走 PR 合并）

本项目不允许以“直接 push 到 main”作为常规发布流程，必须走 PR：

1. 从 `main` 创建功能分支开发。
2. 本地完成修改后，执行验证：

   ```bash
   pnpm format && pnpm lint && pnpm build
   ```

3. 如果改动命中以下任一范围，必须先执行字体裁剪并提交产物：
   - `src/assets/fonts/raw/**`
   - `src/content/**/*.md`
   - `src/i18n/lang/**/*.ts`
   - `astro-paper.config.ts`

   ```bash
   node scripts/subset-fonts.js
   ```

4. 发起到 `main` 的 PR，等待 `PR Checks (Font Subset + Build)` 通过后再合并。
5. PR 合并到 `main` 后，由 `Deploy to GitHub Pages` 自动部署。

> 说明：若 PR 命中字体裁剪触发条件，但 `src/assets/fonts/*.ttf` 未更新提交，CI 会失败。

## 相关工具

| 类别     | 工具                        |
| -------- | --------------------------- |
| 格式化   | Prettier                    |
| Lint     | ESLint                      |
| 类型检查 | TypeScript + @astrojs/check |
| 构建     | Astro + Vite                |
| 测试     | 未配置                      |
