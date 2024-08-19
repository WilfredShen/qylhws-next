import React from "react";

import { Link, Redo2 } from "lucide-react";

import type { ElementProps } from "@/types/element";
import { omitNode } from "@/utils/common";

export interface AnchorProps
  extends ElementProps,
    React.AnchorHTMLAttributes<HTMLAnchorElement> {
  externalIcon?: React.ReactNode;
  backRefIcon?: React.ReactNode;
}

const Anchor = (props: AnchorProps) => {
  const {
    href,
    children,
    externalIcon = <Link style={{ marginLeft: "0.2em" }} />,
    backRefIcon = <Redo2 style={{ transform: "rotate(180deg)" }} />,
  } = props;

  const isExternal = !!href?.match(/([a-zA-Z\d-]+:)?\/\//);

  if (isExternal)
    return (
      <a {...omitNode(props)} target="_blank" rel="noreferer">
        {children}
        {externalIcon}
      </a>
    );

  if ("data-footnote-ref" in props)
    return <a {...omitNode(props)}>[{children}]</a>;

  if ("data-footnote-backref" in props)
    return <a {...omitNode(props)}>{backRefIcon}</a>;

  return <a {...omitNode(props)}>{children}</a>;
};

export default Anchor;
