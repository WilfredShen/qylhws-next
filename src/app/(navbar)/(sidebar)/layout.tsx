import { ReactNode } from "react";

import "./layout.scss";

export interface WithSidebarLayoutProps {
  children?: ReactNode;
  sidebar?: ReactNode;
}

const WithSidebarLayout = (props: WithSidebarLayoutProps) => {
  const { children, sidebar } = props;

  return (
    <>
      {sidebar}
      <main className="page-main">{children}</main>
    </>
  );
};

export default WithSidebarLayout;
