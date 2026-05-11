# 开发流程

## 代码修改后的验证流程

每次修改代码后，按以下顺序执行：

```bash
pnpm format && pnpm lint && pnpm build
```

### 流程说明

| 步骤 | 命令 | 说明 |
|---|---|---|
| 1 | `pnpm format` | 格式化代码（自动修复格式问题） |
| 2 | `pnpm lint` | 检查代码规范并修复问题 |
| 3 | `pnpm build` | 类型检查 + 构建生产版本 |

## 开发预览

```bash
pnpm dev   # 启动开发服务器
pnpm build && pnpm preview  # 构建后预览
```

## 相关工具

| 类别 | 工具 |
|---|---|
| 格式化 | Prettier |
| Lint | ESLint |
| 类型检查 | TypeScript + @astrojs/check |
| 构建 | Astro + Vite |
| 测试 | 未配置 |
