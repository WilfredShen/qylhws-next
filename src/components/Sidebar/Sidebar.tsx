import React from "react";

import { Menu } from "antd";
import type { MenuItemType } from "antd/es/menu/interface";

import "./Sidebar.scss";

export interface SidebarProps {
  items: MenuItemType[];
}

const Sidebar = (props: SidebarProps) => {
  const { items } = props;
  return (
    <div className="sidebar">
      <Menu items={items} />
    </div>
  );
};

export default Sidebar;
