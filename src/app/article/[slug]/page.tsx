import React from "react";

import Markdown from "@/components/Markdown";

interface Props {
  slug: string;
}

const Article = async (_props: Props) => {
  const markdown = await getPost();
  return <Markdown content={markdown} />;
};

export default Article;

export async function generateStaticParams() {
  return [{ slug: "1" }, { slug: "2" }];
}

async function getPost() {
  const data = await fetch(
    "http://localhost:3000/examples/async-and-promise.md",
    {
      cache: "no-cache",
    },
  );
  return data.text();
}
