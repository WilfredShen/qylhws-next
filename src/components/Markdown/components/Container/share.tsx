import type { ComponentType } from "react";

import type { ElementProps } from "@/types/element";
import { mergeClassNames } from "@/utils/classnames";

export interface ContainerProps extends ElementProps {
  type: string;
  meta?: string;
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const components: Map<string, [ComponentType<any>, any?]> = new Map();

const DEFAULT_KEY = "default";

export function registerComponent<T extends ContainerProps>(
  name: string,
  component: ComponentType<T>,
  defaultProps?: T,
) {
  if (!name) return;

  components.set(name, [component, defaultProps]);
}

export function getComponent<T extends ContainerProps>(
  name: string,
): [ComponentType<T>, T?] {
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
