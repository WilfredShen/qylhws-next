import type { ArticleType, BaseType, StrapiResponse } from "@/types/strapi";
import request from "@/utils/request";
import SQBuilder from "@/utils/strapi-query";

export function getArticle(params: Pick<ArticleType, "slug">) {
  const { slug } = params;

  const builder = new SQBuilder<ArticleType>();
  const query = builder
    .filters("slug", e => e.eq(slug))
    .populate("*")
    .build();

  return request.get<StrapiResponse<ArticleType[]>>("/strapi/articles", query);
}

export function listArticles() {
  const builder = new SQBuilder<ArticleType>();
  const query = builder.fields(["slug"]).pageSize(10000).build();

  return request.get<StrapiResponse<(BaseType & Pick<ArticleType, "slug">)[]>>(
    "/strapi/articles",
    query,
  );
}
