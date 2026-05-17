function extractText(node) {
  if (!node || typeof node !== "object") return "";
  if (node.type === "text") return node.value || "";
  if (!Array.isArray(node.children)) return "";
  return node.children.map(extractText).join("");
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export default function remarkCollapseToc(options = {}) {
  const test = options.test ?? /^table of contents$/i;

  return (tree) => {
    if (!tree || !Array.isArray(tree.children)) return;

    for (let i = 0; i < tree.children.length - 1; i++) {
      const current = tree.children[i];
      const next = tree.children[i + 1];

      if (current?.type !== "heading") continue;
      if (next?.type !== "list") continue;

      const headingText = extractText(current).trim();
      const matched =
        typeof test === "string"
          ? headingText === test
          : Boolean(test.test(headingText));

      if (!matched) continue;

      const summary = escapeHtml(headingText);
      const openNode = {
        type: "html",
        value: `<details><summary>${summary}</summary>`,
      };
      const closeNode = { type: "html", value: "</details>" };

      tree.children.splice(i, 2, openNode, next, closeNode);
      i += 2;
    }
  };
}
