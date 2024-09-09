import { useMemo } from "react";

import { Tag } from "antd";
import { shuffle } from "lodash";

import { TagType } from "@/types/strapi";

import RouteLink from "../RouteLink";

import "./ArticleTagList.scss";

export interface ArticleTagListProps {
  tags: TagType[];
  colors?: string[];
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
  const { tags, colors } = props;

  /** 使用指定的序列或者随机的默认序列 */
  const colorArray = useMemo(() => colors ?? shuffle(DEFAULT_COLORS), [colors]);

  return (
    <div className="article-tag-list">
      {tags.map(({ slug, label }, index) => (
        <RouteLink className="article-tag" key={slug} href={`/tags`}>
          <Tag color={colorArray[index % colorArray.length]}>{label}</Tag>
        </RouteLink>
      ))}
    </div>
  );
};

export default ArticleTagList;
