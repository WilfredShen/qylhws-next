import type { ArticleType, Response } from "@/types/strapi";
import request from "@/utils/request";
import SQBuilder from "@/utils/strapi-query";

export function getArticle(params: Pick<ArticleType, "slug">) {
  const { slug } = params;

  const builder = new SQBuilder<ArticleType>();
  const query = builder
    .filters("slug", e => e.eq(slug))
    .populate("*")
    .build();

  return request.get<typeof query, Response<ArticleType[]>>(
    "/api/articles",
    query,
  );
}
