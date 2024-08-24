"use client";

import { useCallback, useMemo } from "react";

import { Menu as AntdMenu } from "antd";
import { uniq } from "lodash";
import { usePathname } from "next/navigation";

import type { MenuItemType } from "@/types/menu";
import type { Nullable } from "@/types/utils";
import dstore from "@/utils/dstore";

export interface MenuProps {
  items: MenuItemType[];
  articleMap: Record<string, MenuItemType>;
}

const DSTORE_PATH_KEY = "__previous_open_keys__";

const Menu = (props: MenuProps) => {
  const { items, articleMap } = props;

  const pathname = usePathname();

  const [defaultPath, defaultKey] = useMemo(() => {
    const prevKeys = dstore.get<string[]>(DSTORE_PATH_KEY);
    const [first, second] = pathname.split("/").filter(Boolean);

    const articleItem = articleMap[second];
    if (first !== "article" || !articleItem) {
      return [prevKeys];
    }

    const path: string[] = [];
    let item: Nullable<MenuItemType> = articleItem;
    while (item) {
      path.unshift(item.key);
      item = item.parent;
    }

    const current = uniq([...(prevKeys ?? []), ...path]);
    dstore.set(DSTORE_PATH_KEY, current);
    return [current, path.slice(-1)];
  }, [articleMap, pathname]);

  const handleOpenChange = useCallback((openKeys: string[]) => {
    dstore.set(DSTORE_PATH_KEY, openKeys);
  }, []);

  return (
    <AntdMenu
      defaultOpenKeys={defaultPath}
      defaultSelectedKeys={defaultKey}
      onOpenChange={handleOpenChange}
      mode="inline"
      items={items}
    />
  );
};

export default Menu;
