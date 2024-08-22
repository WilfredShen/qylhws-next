import React from "react";

import type { ElementProps } from "@/types/element";
import { omitNode } from "@/utils/common";
import Note from "../Container/Note";

export interface BlockQuoteProps
  extends ElementProps,
    React.BlockquoteHTMLAttributes<HTMLQuoteElement> {}

const BlockQuote = (props: BlockQuoteProps) => {
  const note = parseNote(props);
  if (note) return note;

  return <blockquote {...omitNode(props)} />;
};

export default BlockQuote;

function parseNote(props: BlockQuoteProps) {
  const { children } = props;

  if (!Array.isArray(children)) return;

  let firstParagraphIndex = -1;
  for (const [index, item] of children.entries()) {
    if (typeof item === "object" && item.type === "p") {
      firstParagraphIndex = index;
      break;
    }
  }

  if (firstParagraphIndex === -1) return;

  const pattern = /^\s*\[!([^\]]*)\](.*)/;
  const firstParagraph: React.ReactElement = children[firstParagraphIndex];
  const restParagraphs = children.slice(firstParagraphIndex + 1);
  if (Array.isArray(firstParagraph.props.children)) {
    const [firstText] = firstParagraph.props.children;
    if (typeof firstText !== "string") return;

    const type = firstText.match(pattern)?.[1];

    return (
      <Note
        type="note"
        noteType={type?.trim() || undefined}
        title={firstParagraph.props.children.slice(1)}
      >
        {restParagraphs}
      </Note>
    );
  } else if (typeof firstParagraph.props.children === "string") {
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
