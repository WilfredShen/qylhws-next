import type { Nullable } from "@/types/utils";

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isValid<T>(value: Nullable<T>): value is T {
  return !isUndefined(value) && !isNull(value);
}

export function isEmptyString(value: Nullable<string>): value is "" {
  return value === "";
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

export function isInt(value: unknown): boolean {
  return Number.isInteger(value);
}
