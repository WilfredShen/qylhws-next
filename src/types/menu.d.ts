import type { ReactNode } from "react";

export interface MenuItemType {
  key: string;
  label: ReactNode;
  children?: MenuItemType[];
  parent?: MenuItemType;
}
