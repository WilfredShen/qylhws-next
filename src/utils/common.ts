import { Fragment, ReactNode } from "react";

import { Nodes } from "hast";
import {
  Components as JsxComponents,
  toJsxRuntime,
} from "hast-util-to-jsx-runtime";
import { jsx, jsxs } from "react/jsx-runtime";

export const toJsx = <Components extends Partial<JsxComponents>>(
  root: Nodes,
  components?: Components,
): ReactNode => {
  return toJsxRuntime(root, {
    Fragment,
    components,
    //@ts-expect-error: type of the first argument does not match
    jsx,
    //@ts-expect-error: type of the first argument does not match
    jsxs,
    passKeys: true,
    passNode: true,
  });
};
