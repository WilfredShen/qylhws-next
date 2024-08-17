import React from "react";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

import "./layout.scss";

interface ArticleLayoutProps {
  children?: React.ReactNode;
}

const ArticleLayout = (props: ArticleLayoutProps) => {
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
