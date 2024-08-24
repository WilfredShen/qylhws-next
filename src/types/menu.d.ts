import type { ReactNode } from "react";

import type { Nullable } from "./utils";

export interface MenuItemType {
  key: string;
  label: ReactNode;
  order: number;
  children?: MenuItemType[];
  parent?: Nullable<MenuItemType>;
}
