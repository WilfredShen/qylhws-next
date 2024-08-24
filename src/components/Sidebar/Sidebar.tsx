import dynamic from "next/dynamic";

import { getNavigations } from "@/api/article";
import { NavigationTypeEnum } from "@/share/enum";
import type { MenuItemType } from "@/types/menu";
import type { Nullable } from "@/types/utils";

import RouteLink from "../RouteLink";

import "./Sidebar.scss";

const Menu = dynamic(() => import("./Menu"), { ssr: false });

const Sidebar = async () => {
  const navigations = await getNavigations();
  const flatMap: Record<string, MenuItemType> = {};
  const articleMap: Record<string, MenuItemType> = {};

  /** 将所有 navigation 转换为 menu item */
  navigations.forEach(nav => {
    const { documentId, label, type, link, order } = nav;

    const menuItem: MenuItemType = {
      key: documentId,
      label:
        type === NavigationTypeEnum.LINK ? (
          <RouteLink href={link!}>{label}</RouteLink>
        ) : (
          label
        ),
      order,
      parent: null,
    };

    flatMap[documentId] = menuItem;
  });

  /** 填充 children */
  navigations.forEach(nav => {
    const { documentId, type, children, articles } = nav;

    // link 节点没有子节点
    if (type === NavigationTypeEnum.LINK) return;

    const menuItem = flatMap[documentId];

    if (type === NavigationTypeEnum.FOLDER) {
      /** folder 节点，子节点为所有的 children */

      menuItem.children = [];
      children?.forEach(child => {
        const subItem = flatMap[child.documentId];
        menuItem.children!.push(subItem);
        subItem.parent = menuItem;
      });
      menuItem.children.sort((a, b) => a.order - b.order);
    } else {
      /** node 节点，子节点为所有的 articles，若有且只有一个子节点，则使用该子节点替换当前节点 */

      if (articles && articles.length === 1) {
        const article = articles[0];
        menuItem.key = article.documentId;
        menuItem.label = (
          <RouteLink href={`/article/${article.slug}`}>
            {article.title}
          </RouteLink>
        );
        articleMap[article.slug] = menuItem;
      } else {
        menuItem.children = [];
        articles?.forEach(article => {
          const subItem: MenuItemType = {
            key: article.documentId,
            label: (
              <RouteLink href={`/article/${article.slug}`}>
                {article.title}
              </RouteLink>
            ),
            order: 0,
            parent: menuItem,
          };
          menuItem.children!.push(subItem);
          subItem.parent = menuItem;
          articleMap[article.slug] = subItem;
        });
      }
    }
  });

  const validMap: Record<string, MenuItemType> = {};
  const topLevelItems = Object.values(flatMap)
    .filter(e => e.parent === null)
    .map(e => trimEmptyNode(e))
    .filter(e => !!e);

  return (
    <div className="sidebar">
      <Menu items={topLevelItems} articleMap={articleMap} />
    </div>
  );

  function trimEmptyNode(node: MenuItemType): Nullable<MenuItemType> {
    if (!node.children) return node;
    node.children = node.children
      .map(child => trimEmptyNode(child))
      .filter(child => !!child);
    if (!node.children.length) return null;

    node.children.forEach(child => (validMap[child.key] = child));
    return node;
  }
};

export default Sidebar;
