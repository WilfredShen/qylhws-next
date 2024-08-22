import type { Paragraph, Parent } from "mdast";
import type { Code } from "micromark-util-types";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

export interface RemarkContainerOptions {
  fenceCode?: NonNullable<Code>;
}

const remarkBlockQuote: Plugin<[]> = function () {
  const notePattern = /^\s*\[![^\]]*\]/;

  return tree => visit(tree, "paragraph", visitor);

  function visitor(node: Paragraph, index: number, parent: Parent) {
    if (!parent || parent.type !== "blockquote") return;

    const { children } = node;

    /** 确保 blockquote 第一个 paragraph 子元素不为多行文本 */
    const [firstChild] = children;
    if (firstChild && firstChild.type === "text") {
      const index = firstChild.value.indexOf("\n");
      if (index >= 0 && notePattern.test(firstChild.value)) {
        const firstLine = firstChild.value.slice(0, index);
        const others = firstChild.value.slice(index + 1);
        firstChild.value = others;
        parent.children.unshift({
          type: "paragraph",
          children: [
            {
              type: "text",
              value: firstLine,
            },
          ],
        });
      }
    }
  }
};

export default remarkBlockQuote;
