import React from "react";

import type { LinkProps } from "next/link";
import Link from "next/link";

export interface RouteLinkProps
  extends LinkProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> {
  children?: React.ReactNode;
}

const RouteLink = (props: RouteLinkProps) => {
  return <Link rel="noreferer" {...props} />;
};

export default RouteLink;
