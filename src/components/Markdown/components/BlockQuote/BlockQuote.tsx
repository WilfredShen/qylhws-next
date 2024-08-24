import type { BlockquoteHTMLAttributes, ReactElement, ReactNode } from "react";

import type { ElementProps } from "@/types/element";
import { omitNode } from "@/utils/common";

import Note from "../Container/Note";

export interface BlockQuoteProps
  extends ElementProps,
    BlockquoteHTMLAttributes<HTMLQuoteElement> {}

const BlockQuote = (props: BlockQuoteProps) => {
  const note = parseNote(props);
  if (note) return note;

  return <blockquote {...omitNode(props)} />;
};

export default BlockQuote;

/**
 * 解析是否为 Note
 *
 * @param props
 * @returns
 */
function parseNote(props: BlockQuoteProps) {
  const { children } = props;

  if (!Array.isArray(children)) return;

  /** 找到第一个元素，并且该元素为 p 元素 */
  let firstParagraphIndex = -1;
  for (const [index, item] of children.entries()) {
    if (typeof item === "object") {
      if (item.type === "p") firstParagraphIndex = index;
      break;
    }
  }
  if (firstParagraphIndex === -1) return;

  const pattern = /^\s*\[!([^\]]*)\](.*)/;
  const firstParagraph: ReactElement = children[firstParagraphIndex];
  const restParagraphs = children.slice(firstParagraphIndex + 1);
  if (Array.isArray(firstParagraph.props.children)) {
    /** 第一个 p 元素有多个子元素 */

    /** 第一个子元素为文本节点时，才可能为 Note */
    const [firstText] = firstParagraph.props.children;
    if (typeof firstText !== "string") return;

    const match = firstText.match(pattern);
    if (!match) return;

    /** 解析 note 类型，并将剩余部分作为 title 的一部分 */
    const [_, type, rest] = match;
    const title: ReactNode[] = firstParagraph.props.children.slice(1);
    if (rest?.trimStart()) title.unshift(rest.trimStart());

    return (
      <Note type="note" noteType={type?.trim() || undefined} title={title}>
        {restParagraphs}
      </Note>
    );
  } else if (typeof firstParagraph.props.children === "string") {
    /** 第一个 p 元素只有单个文本子元素 */

    const text: string = firstParagraph.props.children;
    const [_, type, title] = text.match(pattern) ?? [];

    return (
      <Note
        type="note"
        noteType={type?.trim() || undefined}
        title={title?.trim() || undefined}
      >
        {restParagraphs}
      </Note>
    );
  }
}
