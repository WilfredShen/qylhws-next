import React from "react";

import type { Props } from "hast-util-to-jsx-runtime";

export interface ElementProps {
  children?: React.ReactNode;
  node?: Props["node"];
}
