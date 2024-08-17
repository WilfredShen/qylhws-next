import { Props } from "hast-util-to-jsx-runtime";
import React, { FC } from "react";

import { mergeClassNames } from "@/utils/classnames";

export type ContainerProps<T = unknown> = Props & {
  type: string;
  meta?: string;
  className?: string;
} & T;

const components: Map<string, FC<ContainerProps>> = new Map();

const DEFAULT_KEY = "default";

export function registerComponent(name: string, component: FC<ContainerProps>) {
  if (!name) return;

  components.set(name, component);
}

export function getComponent(name: string) {
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
