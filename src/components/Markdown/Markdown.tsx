import React from "react";

import { Components as JsxComponents } from "hast-util-to-jsx-runtime";
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

import Badge from "../Badge";
import Container from "../Container";

export interface MarkdownProps {
  content: string;
}

type Components = {
  [key in keyof JsxComponents | `ws-${string}`]: key extends keyof JsxComponents
    ? JsxComponents[key]
    : React.FC<any>;
};

const components: Partial<Components> = {
  "ws-container": Container,
  "ws-badge": Badge,
};

const Markdown = (props: MarkdownProps) => {
  const { content } = props;

  const file = new VFile({ value: content });
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkEmoji)
    .use(remarkContainer) // 自定义容器
    .use(remarkBadge) // 自定义徽章
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeCodeBlock, { lineNumbers: true, maxHeight: 394 }) // 拓展代码块功能
    .use(rehypeRaw); // 解析 HTML 标签

  const mdast = processor.parse(file);
  const hast = processor.runSync(mdast, file);

  return toJsx(hast, components);
};

export default Markdown;
