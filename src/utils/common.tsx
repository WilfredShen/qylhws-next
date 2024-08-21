import React from "react";

import { Nodes } from "hast";
import {
  Components as JsxComponents,
  toJsxRuntime,
} from "hast-util-to-jsx-runtime";
import { jsx, jsxs } from "react/jsx-runtime";

export function toJsx<Components extends Partial<JsxComponents>>(
  root: Nodes,
  components?: Components,
): React.ReactNode {
  return toJsxRuntime(root, {
    Fragment: React.Fragment,
    components,
    //@ts-expect-error: type of the first argument does not match
    jsx,
    //@ts-expect-error: type of the first argument does not match
    jsxs,
    passKeys: true,
    passNode: true,
  });
}

type WithDefaultProps<P, D> = Omit<P, keyof D> & Partial<D>;

export function bindDefaultProps<P extends object, D extends Partial<P>>(
  Comp: React.ComponentType<P>,
  defaultProps: D,
): (props: WithDefaultProps<P, D>) => React.ReactElement {
  // eslint-disable-next-line react/display-name
  return props => <Comp {...defaultProps} {...(props as P)} />;
}

export function childrenToString(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children))
    return children.map(child => childrenToString(child)).join("");
  if (React.isValidElement(children))
    return childrenToString(children.props.children);
  return "";
}

export function omitNode<T extends { node?: unknown }>(
  props: T,
): Omit<T, "node"> {
  const { node, ...otherProps } = props;
  return otherProps;
}
