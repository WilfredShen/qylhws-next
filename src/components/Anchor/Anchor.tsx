import React from "react";

import { Link, Redo2 } from "lucide-react";

import type { ElementProps } from "@/types/element";

export interface AnchorProps
  extends ElementProps,
    React.AnchorHTMLAttributes<HTMLAnchorElement> {
  externalIcon?: React.ReactNode;
  backRefIcon?: React.ReactNode;
}

const Anchor = (props: AnchorProps) => {
  const { node, ...otherProps } = props;
  const {
    href,
    children,
    externalIcon = <Link />,
    backRefIcon = <Redo2 style={{ transform: "rotate(180deg)" }} />,
  } = props;

  const isExternal = !!href?.match(/([a-zA-Z\d-]+:)?\/\//);

  if (isExternal) {
    return (
      <a {...otherProps} target="_blank" rel="noreferer">
        {children}
        {externalIcon}
      </a>
    );
  }

  if ("data-footnote-ref" in props) {
    return <a {...otherProps}>[{children}]</a>;
  }

  if ("data-footnote-backref" in props) {
    return <a {...otherProps}>{backRefIcon}</a>;
  }

  return <a {...otherProps}>{children}</a>;
};

export default Anchor;
