import { ReactNode } from "react";

import "./layout.scss";

export interface WithNavbarLayoutProps {
  children?: ReactNode;
  navbar?: ReactNode;
}

const WithNavbarLayout = (props: WithNavbarLayoutProps) => {
  const { children, navbar } = props;

  return (
    <div className="page-layout">
      {navbar}
      <div className="page-container">{children}</div>
    </div>
  );
};

export default WithNavbarLayout;
