export interface FrontMatter {
  title?: string;
  code?: {
    lineNumbers?: boolean;
    maxHeight?: number | string;
    maxLines?: number;
  };
}
