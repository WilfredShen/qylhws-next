import React from "react";

import { Card } from "antd";

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
        <Card className="content">{children}</Card>
      </main>
    </div>
  );
};

export default ArticleLayout;
