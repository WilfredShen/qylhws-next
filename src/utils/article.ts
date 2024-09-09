import matter from "gray-matter";

import type { ArticleType } from "@/types/strapi";

export function parseArticle(article: ArticleType) {
  const content = article.content.replace(/(^|\n)#\s+.*/g, "");
  const { data: frontmatter } = matter(content);

  return {
    title: article.title || frontmatter.title || "无标题",
    content,
    frontmatter,
  };
}
