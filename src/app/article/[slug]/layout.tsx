import "./layout.scss";

import { FC, PropsWithChildren } from "react";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const ArticleLayout: FC<PropsWithChildren> = props => {
  const { children } = props;
  return (
    <div className="article-page">
      <Navbar />
      <main className="article-main">
        <Sidebar items={[]} />
        <div className="content">{children}</div>
      </main>
    </div>
  );
};

export default ArticleLayout;
