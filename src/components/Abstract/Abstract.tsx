import type { ArticleType } from "@/types/strapi";
import type { NonNull } from "@/types/utils";

import ArticleTagList from "../ArticleTagList";
import Markdown from "../Markdown";
import RouteLink from "../RouteLink";

export interface AbstractProps {
  slug: string;
  title: string;
  abstract: string;
  tags: NonNull<ArticleType["tags"]>;
}

const Abstract = (props: AbstractProps) => {
  const { slug, title, abstract, tags } = props;

  return (
    <div className="abstract">
      <div className="abstract-title">
        <RouteLink href={`/article/${slug}`}>{title}</RouteLink>
      </div>
      <div className="abstract-tags">
        <ArticleTagList tags={tags} />
      </div>
      <div className="abstract-content">
        <Markdown content={abstract} />
      </div>
    </div>
  );
};

export default Abstract;
