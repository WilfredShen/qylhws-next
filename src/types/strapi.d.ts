export interface BaseType {
  id: number;
  documentId: string;
}

export interface CollectionType extends BaseType {
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale: string | null;
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
  error?: object;
}

export interface ArticleType extends BaseType {
  slug: string;
  title: string;
  content: string;
  category?: CategoryType;
  tags?: TagType[];
}

export interface CategoryType extends BaseType {
  slug: string;
  name: string;
  children?: CategoryType[];
  parent?: CategoryType;
  articles?: (BaseType & Pick<ArticleType, "slug" | "title">)[];
}

export interface TagType extends BaseType {
  slug: string;
  label: string;
  articles?: (BaseType & Pick<ArticleType, "slug" | "title">)[];
}
