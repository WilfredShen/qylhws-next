import React from "react";

export interface BadgeProps {
  color?: string;
  chidren?: React.ReactNode;
}

const Badge = (props: BadgeProps) => {
  const { color, chidren } = props;

  return <span>{chidren}</span>;
};

export default Badge;
