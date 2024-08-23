import React from "react";

import { Link, Redo2 } from "lucide-react";
import RouteLink from "next/link";

import type { ElementProps } from "@/types/element";
import { omitNode } from "@/utils/common";

export interface AnchorProps
  extends ElementProps,
    React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
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
      <RouteLink {...omitNode(props)} target="_blank" rel="noreferer">
        {children}
        {externalIcon}
      </RouteLink>
    );

  if ("data-footnote-ref" in props)
    return <RouteLink {...omitNode(props)}>[{children}]</RouteLink>;

  if ("data-footnote-backref" in props)
    return <RouteLink {...omitNode(props)}>{backRefIcon}</RouteLink>;

  return <RouteLink {...omitNode(props)}>{children}</RouteLink>;
};

export default Anchor;
