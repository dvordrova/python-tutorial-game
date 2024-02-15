import React, { FC, useState, useEffect } from "react";

import { Menu } from "antd";
import SubMenu from "antd/lib/menu/SubMenu";

import { Link } from "react-router-dom";
import { getLevels } from "../service/http";

interface RootpageProps {
  children: React.ReactNode;
  levelId?: number;
}

export const Rootpage: FC<RootpageProps> = (props) => {
  const [menuItems, setMenuItems] = useState<JSX.Element[]>([]);

  useEffect(() => {
    getLevels().then((levels) => {
      let newMenuItems: JSX.Element[] = [];
      for (let i = 0; i < levels.count; ++i) {
        newMenuItems.push(
          <Menu.Item key={i}>
            <p>
              <Link reloadDocument to={`/level/${i}`}>
                {i}
              </Link>
            </p>
          </Menu.Item>,
        );
      }
      setMenuItems(newMenuItems);
    });
  }, []);

  if (props.levelId === undefined) {
    return (
      <>
        <Menu mode="horizontal">
          <SubMenu key="SubMenu" title="Уровни">
            {menuItems}
          </SubMenu>
        </Menu>
        {props.children}
      </>
    );
  } else {
    return (
      <>
        <Menu mode="horizontal" selectedKeys={[props.levelId.toString()]}>
          <SubMenu key="SubMenu" title="Уровни">
            {menuItems}
          </SubMenu>
        </Menu>
        {props.children}
      </>
    );
  }
};
