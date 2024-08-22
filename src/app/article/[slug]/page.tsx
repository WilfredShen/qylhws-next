import React from "react";

import fs from "fs";
import path from "path";

import Markdown from "@/components/Markdown";

interface ArticleProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const Article = async (props: ArticleProps) => {
  const markdown = await getPost(props);
  return <Markdown content={markdown} />;
};

export default Article;

export async function generateStaticParams() {
  return [{ slug: "1" }];
}

async function getPost(props: ArticleProps) {
  console.log(props);
  const filePath = path.join(process.cwd(), "examples", "async-and-promise.md");
  return fs.readFileSync(filePath).toString();
}
