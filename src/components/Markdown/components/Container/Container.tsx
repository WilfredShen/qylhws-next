import { type ContainerProps, getComponent } from "./share";

const Container = <T extends ContainerProps>(props: T) => {
  const { type } = props;

  const [Component, defaultProps] = getComponent<T>(type.toLowerCase());

  return <Component {...defaultProps} {...props} />;
};

export default Container;
