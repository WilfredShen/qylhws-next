import { Components as JsxComponents } from "hast-util-to-jsx-runtime";
import { FC } from "react";
import rehypeRaw from "rehype-raw";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { VFile } from "vfile";

import remarkBadge from "@/plugins/badge";
import rehypeCodeBlock from "@/plugins/code-block/rehype";
import remarkContainer from "@/plugins/container";
import { toJsx } from "@/utils/common";

import Container from "./Container";

interface Props {
  content: string;
}

type Components = {
  [key in keyof JsxComponents | "ws-container"]: FC<any>;
};

const components: Partial<Components> = {
  "ws-container": Container,
  // code: Code,
};

const Markdown: FC<Props> = props => {
  const { content } = props;

  const file = new VFile({ value: content });
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkEmoji)
    .use(remarkContainer)
    .use(remarkBadge)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeCodeBlock, { lineNumbers: true, maxHeight: 394 })
    .use(rehypeRaw);

  const mdast = processor.parse(file);
  const hast = processor.runSync(mdast, file);

  return toJsx(hast, components as JsxComponents);
};

export default Markdown;
