import { isEmptyString, isValid } from "./validate";

export type DStoreItemType =
  | string
  | number
  | boolean
  | DStoreItemType[]
  | {
      [key: string]: DStoreItemType;
    };

function has(key: string): boolean {
  const item = localStorage.getItem(key);
  return isValid(item);
}

function get<T>(key: string): T | undefined {
  const item = localStorage.getItem(key);
  if (!isValid(item) || isEmptyString(item)) return;
  return JSON.parse(item);
}

function set(key: string, value: DStoreItemType) {
  return localStorage.setItem(key, JSON.stringify(value));
}

function remove(key: string) {
  return localStorage.removeItem(key);
}

const dstore = {
  has,
  get,
  set,
  remove,
};

export default dstore;
