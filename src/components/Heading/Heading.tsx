import React from "react";

import { toString } from "hast-util-to-string";

import { ElementProps } from "@/types/element";
import { bindDefaultProps, childrenToString } from "@/utils/common";

import "./Heading.scss";

export interface HeadingProps extends ElementProps {
  level: number;
  anchor?: React.ReactNode;
}

const Heading = (props: HeadingProps) => {
  const {
    node,
    level,
    children: _children,
    anchor = "#",
    ...otherProps
  } = props;

  const [anchorText, children] = getAnchorText(node, _children);

  return React.createElement(
    `h${level}`,
    {
      ...otherProps,
      tabIndex: -1,
      id: anchorText,
      className: "ws-heading",
    },
    children,
    <a className="ws-heading-anchor" href={`#${anchorText}`}>
      {anchor}
    </a>,
  );
};

export default Heading;

const h1 = bindDefaultProps(Heading, { level: 1 });
const h2 = bindDefaultProps(Heading, { level: 2 });
const h3 = bindDefaultProps(Heading, { level: 3 });
const h4 = bindDefaultProps(Heading, { level: 4 });
const h5 = bindDefaultProps(Heading, { level: 5 });
const h6 = bindDefaultProps(Heading, { level: 6 });

export { h1, h2, h3, h4, h5, h6 };

function getAnchorText(
  node: HeadingProps["node"],
  children: HeadingProps["children"],
): [string, HeadingProps["children"]] {
  if (typeof children === "string") children = [children];

  const pattern = /\{#([^{}]*)\}/;

  if (Array.isArray(children)) {
    for (const i in children) {
      const item = children[i];

      if (typeof item !== "string") continue;

      const match = item.match(pattern);
      const matched = match?.[1].trim();

      if (matched) {
        const newChildren = [...children];
        newChildren[i] = item.replace(pattern, "");
        return [matched, newChildren];
      }
    }
  }

  return [node ? toString(node) : childrenToString(children), children];
}
