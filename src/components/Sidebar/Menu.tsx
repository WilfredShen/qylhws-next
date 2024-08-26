"use client";

import { useMemo, useState } from "react";

import { useLocalStorageState, useMount } from "ahooks";
import { Menu as AntdMenu } from "antd";
import { uniq } from "lodash";
import { usePathname } from "next/navigation";

import type { MenuItemType } from "@/types/menu";
import type { Nullable } from "@/types/utils";

export interface MenuProps {
  items: MenuItemType[];
  articleMap: Record<string, MenuItemType>;
}

const LOCAL_OPEN_KEYS_KEY = "__previous_open_keys__";

const Menu = (props: MenuProps) => {
  const { items, articleMap } = props;

  const [openKeys, setOpenKeys] =
    useLocalStorageState<string[]>(LOCAL_OPEN_KEYS_KEY);
  const [selectedKey, setSelectedKey] = useState<string>();
  const selectedKeys = useMemo(
    () => (selectedKey === undefined ? undefined : [selectedKey]),
    [selectedKey],
  );

  const pathname = usePathname();

  useMount(() => {
    const match = pathname.match(/^\/article\/([^/]+)(?:\/|$)/);
    if (!(match && match[1] in articleMap)) return;

    const articleItem = articleMap[match[1]];

    const path: string[] = [];
    let item: Nullable<MenuItemType> = articleItem;
    while (item) {
      path.push(item.key);
      item = item.parent;
    }

    const current = uniq([...(openKeys ?? []), ...path]);
    setOpenKeys(current);
    setSelectedKey(path[0]);
  });

  return (
    <AntdMenu
      openKeys={openKeys}
      selectedKeys={selectedKeys}
      onOpenChange={openKeys => setOpenKeys(openKeys)}
      onClick={({ key }) => setSelectedKey(key)}
      mode="inline"
      items={items}
    />
  );
};

export default Menu;
