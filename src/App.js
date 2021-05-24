import React from "react"
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom"
import Dashboard from "./pages/Dashbord"
import Score from "./pages/Score"

import './App.css';

function App() {

  return (
    <Router>
      <Switch>
        <Route exact path="/score" component={Score} />
        <Route exact path="/" component={Dashboard} />
      </Switch>
    </Router>
  )
}

export default App;
