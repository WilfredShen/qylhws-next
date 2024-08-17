import React from "react";

import "./Badge.scss";
import { mergeClassNames } from "@/utils/classnames";

export interface BadgeProps {
  type?: string;
  children?: React.ReactNode;
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
