import type { AnchorHTMLAttributes, ReactNode } from "react";

import type { LinkProps } from "next/link";
import Link from "next/link";

export interface RouteLinkProps
  extends LinkProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> {
  children?: ReactNode;
}

const RouteLink = (props: RouteLinkProps) => {
  return <Link rel="noreferer" {...props} />;
};

export default RouteLink;
