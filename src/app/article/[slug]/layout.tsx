import React from "react";

import { Card } from "antd";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

import "./layout.scss";

export interface ArticleLayoutProps {
  children?: React.ReactNode;
}

const ArticleLayout = async (props: ArticleLayoutProps) => {
  const { children } = props;

  return (
    <div className="article-page">
      <Navbar />
      <div className="article-page-container">
        <Sidebar />
        <main className="article-main">
          <Card className="content-card">{children}</Card>
        </main>
      </div>
    </div>
  );
};

export default ArticleLayout;
