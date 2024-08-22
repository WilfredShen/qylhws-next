import React from "react";

import matter from "gray-matter";

import { getArticle } from "@/api/article";
import Markdown from "@/components/Markdown";
import { FrontMatter } from "@/types/article";
import { ArticleType } from "@/types/strapi";

import type { ArticlePageProps } from "./types";

const Article = async (props: ArticlePageProps) => {
  const { params } = props;
  const { slug } = params;

  const article = await getPost(props);
  const content = article.content.replace(/(^|\n)#\s+.*/g, "");

  const { data: frontmatter } = matter(content);
  const contentTitle: string = article.title || frontmatter.title || slug;

  return (
    <>
      <div className="content-header">
        <h1 className="content-title">{contentTitle}</h1>
      </div>
      <div className="content">
        <Markdown content={content} />
      </div>
      <hr style={{ marginTop: 32 }} />
    </>
  );
};

export default Article;

export async function generateStaticParams() {
  return [{ slug: "browser-event-loop" }];
}

async function getPost(props: ArticlePageProps): Promise<ArticleType> {
  return getArticle({ slug: props.params.slug }).then(({ data }) => data[0]);
}
