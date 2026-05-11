/**
 * 从 Markdown 正文提取纯文本摘要
 */

// 移除 Markdown 语法，提取纯文本
export function stripMarkdown(markdown: string): string {
  return (
    markdown
      // 移除 frontmatter
      .replace(/^---[\s\S]*?---\n*/m, "")
      // 移除代码块
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`]+`/g, "")
      // 移除图片
      .replace(/!\[.*?\]\(.*?\)/g, "")
      // 移除链接但保留文字
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // 移除标题标记
      .replace(/^#{1,6}\s+/gm, "")
      // 移除粗体/斜体
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/_([^_]+)_/g, "$1")
      // 移除引用标记
      .replace(/^>\s+/gm, "")
      // 移除列表标记
      .replace(/^[\s]*[-*+]\s+/gm, "")
      .replace(/^[\s]*\d+\.\s+/gm, "")
      // 移除 HTML 标签
      .replace(/<[^>]+>/g, "")
      // 移除水平线
      .replace(/^[-*_]{3,}$/gm, "")
      // 规范化空白
      .replace(/\n{2,}/g, " ")
      .replace(/\n/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim()
  );
}

// 从正文提取摘要（前 N 个字符）
export function extractExcerpt(
  markdown: string,
  maxLength: number = 200,
): string {
  const plainText = stripMarkdown(markdown);

  if (plainText.length <= maxLength) {
    return plainText;
  }

  // 在单词边界截断（避免截断中文时出问题，按字符截断）
  const truncated = plainText.slice(0, maxLength);

  // 尝试在标点或空格处截断
  const lastPunctuation = Math.max(
    truncated.lastIndexOf("。"),
    truncated.lastIndexOf("，"),
    truncated.lastIndexOf("！"),
    truncated.lastIndexOf("？"),
    truncated.lastIndexOf(". "),
    truncated.lastIndexOf(", "),
    truncated.lastIndexOf(" "),
  );

  if (lastPunctuation > maxLength * 0.6) {
    return truncated.slice(0, lastPunctuation + 1).trim();
  }

  return truncated.trim();
}
