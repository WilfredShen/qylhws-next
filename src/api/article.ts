import type {
  ArticleType,
  CategoryType,
  CollectionType,
  StrapiResponse,
} from "@/types/strapi";
import request from "@/utils/request";
import SQBuilder from "@/utils/strapi-query";

export function getArticle(params: Pick<ArticleType, "slug">) {
  const { slug } = params;

  const builder = new SQBuilder<ArticleType>();
  const query = builder
    .filters("slug", e => e.eq(slug))
    .populate("*")
    .build();

  return request.get<StrapiResponse<(ArticleType & CollectionType)[]>>(
    "/strapi/articles",
    query,
  );
}

export function getArticles() {
  const builder = new SQBuilder<ArticleType>();
  const query = builder.fields(["slug"]).pageSize(10000).build();

  return request.get<
    StrapiResponse<Pick<ArticleType, "id" | "documentId" | "slug">[]>
  >("/strapi/articles", query);
}

export function getCategories() {
  const builder = new SQBuilder<CategoryType>();
  const query = builder
    .fields(["slug", "name"])
    .populate<CategoryType>("parent", bd => bd.fields(["slug", "name"]))
    .populate<CategoryType>("children", bd => bd.fields(["slug", "name"]))
    .populate<ArticleType>("articles", bd => bd.fields(["slug", "title"]))
    .pageSize(10000)
    .build();

  return request.get<StrapiResponse<CategoryType[]>>(
    "/strapi/categories",
    query,
  );
}
