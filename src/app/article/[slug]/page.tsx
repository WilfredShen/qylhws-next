import matter from "gray-matter";

import { getArticle, getArticleId, getArticles } from "@/api/article";
import Markdown from "@/components/Markdown";
import type { PageProps } from "@/types/page";
import type { ArticleType } from "@/types/strapi";

const Article = async (props: PageProps<Pick<ArticleType, "slug">>) => {
  const { params } = props;
  const { slug } = params;

  const { title, content } = await getPost({ slug });

  return (
    <>
      <div className="content-header">
        <h1 className="content-title">{title}</h1>
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
  const articles = await getArticles();
  return articles.map(({ slug }) => ({ slug }));
}

async function getPost(props: Pick<ArticleType, "slug">) {
  const { slug } = props;

  const { documentId } = await getArticleId({ slug });
  const article = await getArticle({ documentId });

  const content = article.content.replace(/(^|\n)#\s+.*/g, "");
  const { data: frontmatter } = matter(content);

  return {
    title: article.title || frontmatter.title || "无标题",
    content,
    frontmatter,
  };
}
