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

  const [rotateCount, setRotateCount] = useState(0);

  return (
    <div className="related">
      <div className="related-title">相关文章</div>
      <div className="related-content">
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
        </div>
        <div
          className="related-refresh"
          onClick={() => {
            updateSampled();
            setRotateCount(rotateCount + 1);
          }}
        >
          <RefreshCw
            className="related-refresh-icon"
            style={{ transform: `rotate(${rotateCount * 360}deg)` }}
          />
          <span>换一换</span>
        </div>
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
