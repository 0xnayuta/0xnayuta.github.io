# 博客草稿目录

本目录用于存放未发布的博客文章草稿。

## 重要原则

**草稿必须经过人工审阅后才能发布，不要直接发布到 `src/data/blog/`。**

## 目录结构

```
drafts/articles/
  README.md              # 本文件
  2024-01-01-example.md  # 草稿文件
  2024-02-15-another.md
```

## 命名规范

```
<日期>-<slug>.md
```

示例：`2024-05-11-pi-plugin-system-intro.md`

## 工作流程

1. Agent 生成草稿 → 存入 `drafts/articles/`
2. 人工审阅草稿 → 标注修改意见
3. 修改完善草稿 → 保持在本目录
4. 确认发布 → 移动到 `src/data/blog/`
5. 更新 frontmatter：`draft: false`，设置 `pubDatetime`

## 状态标记

在文件顶部添加状态注释：

```markdown
<!-- 状态: 待审阅 -->
<!-- 状态: 需修改 -->
<!-- 状态: 待发布 -->
```

## 审阅清单

- [ ] 内容准确，无事实错误
- [ ] 技术细节正确
- [ ] 个人风格一致
- [ ] 无模板腔
- [ ] 链接有效
- [ ] 代码可运行
- [ ] 配图合适

## 发布操作

```bash
# 1. 将草稿移动到正式目录
mv drafts/articles/2024-05-11-example.md src/data/blog/2024-05-11-example.md

# 2. 修改 frontmatter
# - draft: false
# - pubDatetime: 2024-05-11T00:00:00Z

# 3. 验证构建
pnpm format && pnpm lint && pnpm build
```
