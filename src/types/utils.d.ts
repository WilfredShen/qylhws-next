export type Nullable<T> = T | null | undefined;

export type Entries<T extends object> = [keyof T, T[keyof T]][];
