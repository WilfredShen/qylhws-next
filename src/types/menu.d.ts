import type React from "react";

export interface MenuItemType {
  key: string;
  label: React.ReactNode;
  children?: MenuItemType[];
  parent?: MenuItemType;
}
