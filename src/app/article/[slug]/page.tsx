import React from "react";

import fs from "fs";
import matter from "gray-matter";
import path from "path";

import Markdown from "@/components/Markdown";
import { FrontMatter } from "@/types/article";

import type { ArticlePageProps } from "./types";

const Article = async (props: ArticlePageProps) => {
  const { params } = props;
  const { slug } = params;

  const { content, frontmatter } = await getPost(props);

  const { title } = frontmatter;

  return (
    <>
      <div className="content-header">
        <h1 className="content-title">{title || slug}</h1>
      </div>
      <div className="content">
        <Markdown content={content} />
      </div>
    </>
  );
};

export default Article;

export async function generateStaticParams() {
  return [{ slug: "async-and-promise" }];
}

async function getPost(props: ArticlePageProps): Promise<{
  content: string;
  frontmatter: FrontMatter;
}> {
  const { params } = props;
  const { slug } = params;

  const filePath = path.join(process.cwd(), "examples", `${slug}.md`);
  const content = fs.readFileSync(filePath).toString();

  const { data } = matter(content);

  return { content: content.replace(/(^|\n)#\s+.*/g, ""), frontmatter: data };
}
