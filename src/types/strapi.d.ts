export interface Collection {
  id: number;
  documentId: string;
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

export interface Response<T> {
  data: T;
  meta: {
    pagination?: Pagination;
  };
  error?: object;
}

export interface ArticleType extends Collection {
  slug: string;
  title: string;
  content: string;
  category?: CategoryType;
  tags?: TagType[];
}

export interface CategoryType extends Collection {
  slug: string;
  name: string;
  children?: CategoryType[];
  parent?: CategoryType;
  articles?: ArticleType[];
}

export interface TagType extends Collection {
  label: string;
  articles?: ArticleType[];
}
