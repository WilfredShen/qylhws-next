import React from "react";

import { Tag } from "antd";

import type { ElementProps } from "@/types/element";

import "./Badge.scss";

export interface BadgeProps extends ElementProps {
  color?: string;
}

const Badge = (props: BadgeProps) => {
  const { color, children } = props;

  return (
    <Tag className="ws-badge" color={color}>
      {children}
    </Tag>
  );
};

export default Badge;
