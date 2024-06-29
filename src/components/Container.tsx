import { Props } from "hast-util-to-jsx-runtime";
import React, { FC } from "react";

interface ContainerProps extends Props {
  type: string;
  meta?: string;
  className?: string;
}

const components: Map<string, FC<ContainerProps>> = new Map();
registerComponent("default", props => {
  return <div className="ws-container-default" {...props} />;
});

const Container: FC<ContainerProps> = props => {
  const { type, meta, children } = props;

  const Component = components.get(type) ?? components.get("default")!;

  return (
    <Component type={type} meta={meta}>
      {children}
    </Component>
  );
};

export default Container;

export function registerComponent(name: string, component: FC<ContainerProps>) {
  if (!name) return;
  components.set(name, component);
}
