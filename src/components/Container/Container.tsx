import React from "react";

import { type ContainerProps, getComponent } from "./share";

const Container = <T extends ContainerProps>(props: T) => {
  const { type } = props;

  const [Component, defaultProps] = getComponent<T>(type);

  return <Component {...defaultProps} {...props} />;
};

export default Container;
