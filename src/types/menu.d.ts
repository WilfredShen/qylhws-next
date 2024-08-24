import type { ReactNode } from "react";

export interface MenuItemType {
  key: string;
  label: ReactNode;
  order: number;
  children?: MenuItemType[];
  parent: MenuItemType | null;
}
