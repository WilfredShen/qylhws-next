export type Nullable<T> = T | null | undefined;

export type NonNull<T> = T extends object
  ? { [K in keyof T]-?: NonNull<T[K]> }
  : Exclude<T, null | undefined>;

export type Entries<T extends object> = [keyof T, T[keyof T]][];
