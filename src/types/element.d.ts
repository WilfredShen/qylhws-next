import type { ReactNode } from "react";

import type { Props } from "hast-util-to-jsx-runtime";

export interface ElementProps {
  children?: ReactNode;
  node?: Props["node"];
}
