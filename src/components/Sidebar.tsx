import { Menu } from "antd";
import { MenuItemType } from "antd/es/menu/interface";
import { FC } from "react";

interface Props {
  items: MenuItemType[];
}

const Sidebar: FC<Props> = ({ items }) => {
  return (
    <div className="sidebar">
      <Menu items={items} />
    </div>
  );
};

export default Sidebar;
