import { Card, Tooltip } from "antd";

import {
  getArticle,
  getArticleId,
  getArticles,
  getSpecifiedTags,
} from "@/api/article";
import ArticleTagList from "@/components/ArticleTagList";
import Markdown from "@/components/Markdown";
import type { RelatedArticlesProps } from "@/components/RelatedArticles";
import RelatedArticles from "@/components/RelatedArticles";
import type { PageProps } from "@/types/page";
import type { ArticleType } from "@/types/strapi";
import { parseArticle } from "@/utils/article";
import { formatDateTime } from "@/utils/date";

import "./page.scss";

const Article = async (props: PageProps<Pick<ArticleType, "slug">>) => {
  const { params } = props;
  const { slug } = params;
  const { documentId } = await getArticleId({ slug });
  const article = await getArticle({ documentId });
  const { title, content } = parseArticle(article);
  const { tags, updatedAt } = article;

  const relatedArticles = (
    await getRelatedArticles(tags!.map(({ slug }) => slug))
  ).filter(([item]) => item.slug !== slug);

  const lastUpdatedDateTime = formatDateTime(updatedAt!);

  return (
    <>
      <div aria-hidden className="entry-scroll-anchor" />
      <Card className="content-card">
        <div className="content-header">
          <h1 className="article-title">
            <Tooltip title={title} placement="topLeft">
              {title}
            </Tooltip>
          </h1>
          <div className="article-info">
            <div className="last-updated">最后更新：{lastUpdatedDateTime}</div>
          </div>
          <div className="article-tags">
            <ArticleTagList tags={tags!} />
          </div>
        </div>
        <div className="content">
          <Markdown content={content} />
        </div>
        <hr style={{ margin: "24px 0" }} />
        <RelatedArticles articles={relatedArticles} />
      </Card>
    </>
  );
};

export default Article;

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map(({ slug }) => ({ slug }));
}

async function getRelatedArticles(
  tags: string[],
): Promise<RelatedArticlesProps["articles"]> {
  const data = await getSpecifiedTags(tags);

  const weights: Record<string, number> = {};
  const map: Record<string, ArticleType> = {};
  data.forEach(tag => {
    tag.articles?.forEach(article => {
      const { slug } = article;
      weights[slug] = (weights[slug] ?? 0) + 1;
      map[slug] = article;
    });
  });

  return Object.entries(weights).map(([slug, weight]) => [map[slug], weight]);
}
