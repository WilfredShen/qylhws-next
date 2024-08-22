import rehypeRaw from "rehype-raw";
import remarkEmoji from "remark-emoji";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkUnWrapImages from "remark-unwrap-images";
import { unified } from "unified";
import { VFile } from "vfile";

import { toJsx } from "@/utils/common";

import components from "./components";
import remarkBadge from "./plugins/badge";
import remarkBlockQuote from "./plugins/block-quote";
import rehypeCode from "./plugins/code";
import remarkContainer from "./plugins/container";
import remarkMatter from "./plugins/matter";
import remarkReference from "./plugins/reference";

export interface MarkdownProps {
  content: string;
}

const Markdown = (props: MarkdownProps) => {
  const { content } = props;

  const file = new VFile({ value: content });
  const processor = unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkMatter)
    .use(remarkReference)
    .use(remarkBlockQuote)
    .use(remarkGfm)
    .use(remarkEmoji)
    .use(remarkUnWrapImages)
    .use(remarkContainer) // 自定义容器
    .use(remarkBadge) // 自定义徽章
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeCode, { lineNumbers: true, maxHeight: "auto", maxLines: 20 }) // 拓展代码块功能
    .use(rehypeRaw); // 解析 HTML 标签

  const mdast = processor.parse(file);
  const hast = processor.runSync(mdast, file);

  return toJsx(hast, components);
};

export default Markdown;
