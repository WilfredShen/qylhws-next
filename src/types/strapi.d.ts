import type { NavigationTypeEnum } from "@/share/enum";

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
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  locale?: string | null;
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
    pagination?: Pagination;
  };
  error?: Record<string, unknown>;
}

export interface ArticleType extends BaseType {
  slug: string;
  title: string;
  content: string;
  abstract?: string;
  navigation?: NavigationType;
  category?: CategoryType;
  tags?: TagType[];
}

export interface NavigationType extends BaseType {
  slug: string;
  label: string;
  type: NavigationTypeEnum;
  order: number;
  link?: string;
  parent?: NavigationType;
  children?: NavigationType[];
  articles?: ArticleType[];
}

export interface CategoryType extends BaseType {
  slug: string;
  label: string;
  articles?: ArticleType[];
}

export interface TagType extends BaseType {
  slug: string;
  label: string;
  articles?: ArticleType[];
}
