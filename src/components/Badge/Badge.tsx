import React from "react";

import { ElementProps } from "@/types/element";
import { mergeClassNames } from "@/utils/classnames";

import "./Badge.scss";

export interface BadgeProps extends ElementProps {
  type?: string;
}

const Badge = (props: BadgeProps) => {
  const { type, children } = props;

  return (
    <span className={mergeClassNames("ws-badge", `ws-badge-${type}`)}>
      {children}
    </span>
  );
};

export default Badge;
