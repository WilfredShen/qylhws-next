import type {
  ArticleType,
  BaseType,
  CollectionType,
  NavigationType,
  PickDoc,
  StrapiResponse,
} from "@/types/strapi";
import type { Entries } from "@/types/utils";
import request from "@/utils/request";
import SQBuilder from "@/utils/strapi-query";

export async function getArticleId(
  params: Partial<Pick<ArticleType, "id" | "documentId" | "slug" | "title">>,
) {
  const builder = new SQBuilder<ArticleType>();
  (Object.entries(params) as Entries<typeof params>).forEach(([key, value]) =>
    builder.filters(key, bd => bd.eq(value!)),
  );
  const query = builder.fields(["id"]).build();

  const { data } = await request.get<StrapiResponse<BaseType[]>>(
    `/strapi/articles`,
    query,
  );
  return data[0];
}

export async function getArticle(params: Pick<ArticleType, "documentId">) {
  const { documentId } = params;

  const builder = new SQBuilder<ArticleType>();
  const query = builder.populate("*").build();

  const { data } = await request.get<
    StrapiResponse<CollectionType<ArticleType>>
  >(`/strapi/articles/${documentId}`, query);
  return data;
}

export async function getArticles() {
  const builder = new SQBuilder<ArticleType>();
  const query = builder.fields(["slug"]).pageSize(10000).build();

  const { data } = await request.get<
    StrapiResponse<PickDoc<ArticleType, "slug">[]>
  >("/strapi/articles", query);
  return data;
}

export async function getNavigations() {
  const builder = new SQBuilder<NavigationType>();
  const query = builder
    .fields(["slug", "label", "type", "order", "link"])
    .populate<ArticleType>("articles", bd => bd.fields(["slug", "title"]))
    .populate<NavigationType>("children", bd => bd.fields(["id"]))
    .build();

  const { data } = await request.get<StrapiResponse<NavigationType[]>>(
    "/strapi/navigations",
    query,
  );
  return data;
}
