import React from "react";

import type { Props } from "hast-util-to-jsx-runtime";

import { mergeClassNames } from "@/utils/classnames";

export interface ContainerProps extends Props {
  type: string;
  meta?: string;
  className?: string;
}

const components: Map<string, [React.FC<any>, any?]> = new Map();

const DEFAULT_KEY = "default";

export function registerComponent<T extends ContainerProps>(
  name: string,
  component: React.FC<T>,
  defaultProps?: T,
) {
  if (!name) return;

  components.set(name, [component, defaultProps]);
}

export function getComponent<T extends ContainerProps>(
  name: string,
): [React.FC<T>, T?] {
  return components.get(name) ?? components.get(DEFAULT_KEY)!;
}

registerComponent(DEFAULT_KEY, props => {
  const { className, node, meta, type, ...otherProps } = props;

  return (
    <div
      {...otherProps}
      className={mergeClassNames(className, "ws-container-default")}
    />
  );
});
