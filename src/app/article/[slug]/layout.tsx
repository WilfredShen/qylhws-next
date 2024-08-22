import React from "react";

import { Card } from "antd";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

import type { ArticlePageProps } from "./types";

import "./layout.scss";

interface ArticleLayoutProps extends ArticlePageProps {
  children?: React.ReactNode;
}

const ArticleLayout = (props: ArticleLayoutProps) => {
  const { children } = props;

  return (
    <div className="article-page">
      <Navbar />
      <div className="article-page-container">
        <Sidebar items={[]} />
        <main className="article-main">
          <Card className="content-card">{children}</Card>
        </main>
      </div>
    </div>
  );
};

export default ArticleLayout;
