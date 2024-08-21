import React from "react";

import type { ElementProps } from "@/types/element";
import { omitNode } from "@/utils/common";

export interface BlockQuoteProps
  extends ElementProps,
    React.BlockquoteHTMLAttributes<HTMLQuoteElement> {}

const BlockQuote = (props: BlockQuoteProps) => {
  return <blockquote {...omitNode(props)} />;
};

export default BlockQuote;
