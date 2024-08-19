import { flatten, uniq } from "lodash";

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

export function appendClassNames<
  T extends { className?: string | null | undefined },
>(obj: T, ...classNames: ClassNameParam[]) {
  obj.className = mergeClassNames(obj.className, ...classNames);
}
