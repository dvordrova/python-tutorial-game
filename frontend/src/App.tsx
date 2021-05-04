import { Menu } from 'antd';
import SubMenu from 'antd/lib/menu/SubMenu';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import Level from './Level';

function App() {
  const [showHelp, setShowHelp] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState(["1"])
  const [menuItems, setMenuItems] = useState<JSX.Element[]>([])

  useEffect(() => {
    axios.get("/api/levels").then((response) => {
      let newMenuItems: JSX.Element[] = []
      for (let i = 0; i < response.data.count; ++ i) {
        newMenuItems.push(<Menu.Item key={i}><Link to={`/level/${i}`}>{i}</Link></Menu.Item>)
      }
      setMenuItems(newMenuItems)
    })
  }, [])

  return (
    <>
      <Router>
        <Menu mode="horizontal" theme="dark" selectedKeys={selectedKeys}>
          <SubMenu key="SubMenu" title="Уровни">
              { menuItems }
          </SubMenu>
        </Menu>
        <Switch>
          <Route exact path="/">
            <Redirect to={`/level/${localStorage.getItem('level') || 0}`}></Redirect>
          </Route>
          <Route path="/level/:levelId" children={<Level setMenuSelectedItems={setSelectedKeys}/>}/>
        </Switch>
      </Router>
    </>
  );
}

export default App;
