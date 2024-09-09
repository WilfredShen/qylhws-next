"use client";

import { useCallback, useMemo, useState } from "react";

import { useMount } from "ahooks";
import { RefreshCw } from "lucide-react";

import type { ArticleType } from "@/types/strapi";
import { mergeClassNames } from "@/utils/classnames";
import WeightedSample from "@/utils/WeightedSample";

import ArticleTagList from "../ArticleTagList";
import RouteLink from "../RouteLink";

import "./RelatedArticles.scss";

type RelatedArticleType = Pick<ArticleType, "slug" | "title" | "tags">;

export interface RelatedArticlesProps {
  articles: [RelatedArticleType, number][];
}

const RelatedArticles = (props: RelatedArticlesProps) => {
  const { articles } = props;

  const [sampled, updateSampled] = useSampledArticles(articles);

  return (
    <div className="related-articles">
      {sampled.map(({ slug, title, tags }) => (
        <div
          key={slug}
          className={mergeClassNames("related-article", "ws-shadowed")}
        >
          <div className="related-article-title">
            <RouteLink href={`/article/${slug}`}>{title}</RouteLink>
          </div>
          <div className="related-article-tags">
            <ArticleTagList tags={tags!} />
          </div>
        </div>
      ))}
      <div className="related-article-refresh" onClick={updateSampled}>
        <RefreshCw />
        <span>换一批</span>
      </div>
    </div>
  );
};

export default RelatedArticles;

function useSampledArticles(
  articles: RelatedArticlesProps["articles"],
): [RelatedArticleType[], () => void] {
  const weightedSample = useMemo(
    () =>
      new WeightedSample(
        articles.map(([article]) => article),
        articles.map(([_, w]) => w),
      ),
    [articles],
  );

  const [sampled, setSampled] = useState<RelatedArticleType[]>([]);

  const updateSampled = useCallback(() => {
    setSampled(weightedSample.sample(3, false));
  }, [weightedSample]);

  useMount(() => {
    weightedSample.reset();
    updateSampled();
  });

  return [sampled, updateSampled];
}
