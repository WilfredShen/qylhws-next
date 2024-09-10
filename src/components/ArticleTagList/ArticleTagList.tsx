import { ReactNode, useMemo } from "react";

import { Tag } from "antd";
import { shuffle } from "lodash";

import { TagType } from "@/types/strapi";

import RouteLink from "../RouteLink";

import "./ArticleTagList.scss";

export interface ArticleTagListProps {
  tags: TagType[];
  colors?: string[];
  navigable?: boolean;
}

const DEFAULT_COLORS = [
  "magenta",
  "red",
  "volcano",
  "orange",
  "gold",
  "lime",
  "green",
  "cyan",
  "blue",
  "geekblue",
  "purple",
];

const ArticleTagList = (props: ArticleTagListProps) => {
  const { tags, colors, navigable = true } = props;

  /** 使用指定的序列或者随机的默认序列 */
  const colorArray = useMemo(() => colors ?? shuffle(DEFAULT_COLORS), [colors]);

  const WrapperComp = useMemo(
    (): ((props: { children: ReactNode; slug: string }) => ReactNode) =>
      navigable
        ? ({ children, slug }) => (
            <RouteLink
              className="article-tag"
              href={`/articles?tag=${encodeURIComponent(slug)}`}
            >
              {children}
            </RouteLink>
          )
        : ({ children }) => <div className="article-tag">{children}</div>,
    [navigable],
  );

  return (
    <div className="article-tag-list">
      {tags.map(({ slug, label }, index) => (
        <WrapperComp key={slug} slug={slug}>
          <Tag color={colorArray[index % colorArray.length]}>{label}</Tag>
        </WrapperComp>
      ))}
    </div>
  );
};

export default ArticleTagList;
