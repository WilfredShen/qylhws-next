import type { ReactNode } from "react";

import { Card } from "antd";

export interface ArticleLayoutProps {
  children?: ReactNode;
}

const ArticleLayout = async (props: ArticleLayoutProps) => {
  const { children } = props;

  return <Card className="content-card">{children}</Card>;
};

export default ArticleLayout;
