import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import GameContainer from './GameContainer';
import LeaderBoard from './LeaderBoard';
import NoMatch from './NoMatch';
import Header from './Header';
import Welcome from './Welcome';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';

class App extends React.Component {

  render() {
    return (
        <Router>
          <Header/>

          <div id="router">
            <Switch>
              <Route exact path="/" component={Welcome} />
              <Route path="/lab1" component={GameContainer} />
              <Route path="/leaderboard" component={LeaderBoard} />
              <Route component={NoMatch} />
            </Switch>
          </div>
        </Router>
    );
  }
}

export default App;
