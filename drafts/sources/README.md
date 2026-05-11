# 写作资料包目录

本目录用于存放每个项目的写作资料包。

## 目录结构

```
drafts/sources/
  README.md              # 本文件
  <项目名>/
    source.md            # 项目资料包
    assets/              # 项目相关素材（可选）
```

## 示例

```
drafts/sources/
  devpiano/
    source.md
  devkit-pi/
    source.md
    screenshots/
  pi-subagents/
    source.md
  pi-lsp/
    source.md
```

## 使用流程

1. 开始写某个项目的文章时，先创建对应目录
2. 按 `docs/writing/source-package-template.md` 格式填写资料包
3. 标注需要查证的信息
4. 资料包准备好后，通知 Agent 生成文章大纲

## 命名规范

- 目录名使用项目英文名（小写、连字符分隔）
- 一个项目一个目录
- 避免中文目录名
