import type { NavigationTypeEnum } from "@/share/enum";

import type { Nullable } from "./utils";

export interface BaseType {
  id: number;
  documentId: string;
}

export type PickDoc<
  T extends BaseType,
  K extends Exclude<keyof T, keyof BaseType>,
> = BaseType & Pick<T, K>;

export type OmitDoc<
  T extends BaseType,
  K extends Exclude<keyof T, keyof BaseType>,
> = BaseType & Omit<T, K>;

export interface CollectionType<T extends BaseType> extends T {
  createdAt?: Nullable<string>;
  updatedAt?: Nullable<string>;
  publishedAt?: Nullable<string>;
  locale?: Nullable<string>;
}

export interface Pagination {
  // 第几页
  page: number;
  // 分页大小
  pageSize: number;
  // 总页数
  pageCount: number;
  // 总记录数
  total: number;
}

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: Nullable<Pagination>;
  };
  error?: Nullable<Record<string, unknown>>;
}

export interface ArticleType extends BaseType {
  slug: string;
  title: string;
  content: string;
  abstract?: Nullable<string>;
  navigation?: Nullable<NavigationType>;
  tags?: Nullable<TagType[]>;
}

export interface NavigationType extends BaseType {
  slug: string;
  label: string;
  type: NavigationTypeEnum;
  order: number;
  link?: Nullable<string>;
  parent?: Nullable<NavigationType>;
  children?: Nullable<NavigationType[]>;
  articles?: Nullable<ArticleType[]>;
}

export interface TagType extends BaseType {
  slug: string;
  label: string;
  articles?: Nullable<ArticleType[]>;
}
