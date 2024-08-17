import React from "react";

import { ContainerProps, getComponent } from "./share";

const Container = <T,>(props: ContainerProps<T>) => {
  const { type, meta, children, ...otherProps } = props;

  const Component = getComponent(type);

  return (
    <Component {...otherProps} type={type} meta={meta}>
      {children}
    </Component>
  );
};

export default Container;
