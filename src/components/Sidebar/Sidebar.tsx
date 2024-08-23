import React from "react";

import dynamic from "next/dynamic";

import { getCategories } from "@/api/article";
import type { MenuItemType } from "@/types/menu";

import RouteLink from "../RouteLink";

import "./Sidebar.scss";

const Sidebar = async () => {
  const Menu = dynamic(() => import("./Menu"), { ssr: false });

  const { data } = await getCategories();
  const flatMap: Record<string, MenuItemType> = {};
  const articleMap: Record<string, MenuItemType> = {};
  const firstLevelItems: MenuItemType[] = [];

  /** 将所有 category 转换为 menu item */
  data.forEach(item => {
    const menuItem: MenuItemType = {
      key: item.documentId,
      label: item.name,
    };

    flatMap[item.documentId] = menuItem;
    if (!item.parent) firstLevelItems.push(menuItem);
  });

  /** 填充 children */
  data.forEach(item => {
    const menuItem = flatMap[item.documentId];
    if (item.children || item.articles) {
      menuItem.children = [];

      item.children?.forEach(category => {
        const child = flatMap[category.documentId];
        menuItem.children!.push(child);
        child.parent = menuItem;
      });

      item.articles?.forEach(article => {
        const articleItem = {
          key: article.documentId,
          label: (
            <RouteLink href={`/article/${article.slug}`}>
              {article.title}
            </RouteLink>
          ),
          parent: menuItem,
        };
        menuItem.children!.push(articleItem);
        articleMap[article.slug] = articleItem;
      });
    }
  });

  return (
    <div className="sidebar">
      <Menu items={firstLevelItems} articleMap={articleMap} />
    </div>
  );
};

export default Sidebar;
