import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";
import Level from './Level';


function App() {  
  return (
  <Router>
      <Switch>
        <Route path="/level/:id" children={<Level />} />
      </Switch>
  </Router>
  );
}

export default App;
