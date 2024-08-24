import { flatten, uniq } from "lodash";

import type { Nullable } from "@/types/utils";

export interface ClassNamesOption {
  [className: string]: boolean;
}

export type ClassNameParam =
  | ClassNamesOption
  | string
  | null
  | undefined
  | ClassNameParam[];

export function mergeClassNames(...classNames: ClassNameParam[]) {
  const array: string[] = [];
  flatten([classNames]).forEach(item => {
    if (!item) return;
    if (typeof item === "string") array.push(item);
    if (typeof item === "object")
      Object.entries(item).forEach(([key, value]) => value && array.push(key));
  });
  return uniq(array.filter(e => e.trim())).join(" ");
}

export function appendClassNames<T extends { className?: Nullable<string> }>(
  obj: T,
  ...classNames: ClassNameParam[]
) {
  obj.className = mergeClassNames(obj.className, ...classNames);
}
