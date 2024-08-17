import React from "react";
import { Menu } from "antd";
import { MenuItemType } from "antd/es/menu/interface";

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
