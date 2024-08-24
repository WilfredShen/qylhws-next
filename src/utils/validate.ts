import type { Nullable } from "@/types/utils";

export function isValid<T>(value: Nullable<T>): value is T {
  return value !== undefined && value !== null;
}
