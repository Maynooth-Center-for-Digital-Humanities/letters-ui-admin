import React, { Component } from 'react';
import axios from 'axios';
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import 'axios-progress-bar/dist/nprogress.css';
import './assets/bootstrap/css/bootstrap.min.css';
import './assets/font-awesome/css/font-awesome.min.css';
import './assets/open-sans/css/open-sans.css';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import './App.css';

import {APIPath,basename} from './common/constants';

// views
import {LoginView} from './views/login';
import {ListView} from './views/list-items';
import {UsersListView} from './views/list-users';
import {ItemView} from './views/item.js';

// components
import {TopNavigation} from './components/top-navigation';
import {NavigationSidebar} from './components/navigation-sidebar';

// helpers
import {checkSessionCookies} from './helpers/helpers.js';
//import {preloadContent} from './helpers/preload-content.js';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAdmin: false,
      sidebarOpen: true,
      redirect: false
		};
    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.checkAdminState = this.checkAdminState.bind(this);

  }

  checkAdminState() {
    let sessionActive = sessionStorage.getItem('adminSessionActive');
    if (sessionActive==="true") {
      let context = this;
      let accessToken = sessionStorage.getItem('adminAccessToken');
      axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
      axios.get(APIPath+'user-profile')
      .then(function (response) {
        let status = response.data.status;
        if (typeof status!== undefined && status===true) {
          let roles = response.data.data.roles;
          let isAdmin = false;
          for (let i=0;i<roles.length; i++) {
            let role = roles[i];

            if (role.is_admin===1) {
              isAdmin = true;
            }
          }
          context.setState({
            isAdmin: isAdmin
          });
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    }
    else {
      this.setState({redirect: true})
    }
  }

  setAdmin(isAdmin) {
    this.setState({
      isAdmin: isAdmin
    })
  }

  toggleSidebar() {
    let sidebarOpen = true;
    if (this.state.sidebarOpen) {
      sidebarOpen = false;
    }
    this.setState({
      sidebarOpen:sidebarOpen
    });
  }

  componentWillMount() {
    checkSessionCookies();
    this.checkAdminState();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.redirect) {
      this.setState({
        redirect: false
      });
    }
    if (prevState.isAdmin && !this.state.isAdmin) {
      this.setState({
        redirect: true
      });
    }
  }

  render() {
    let redirectElement;
    let topNav = <TopNavigation toggleSidebar={this.toggleSidebar} sidebarOpen={this.state.sidebarOpen} setAdmin={this.setAdmin.bind(this)} />;
    let sidebar = <NavigationSidebar sidebarOpen={this.state.sidebarOpen} />;
    let extraFirstRoute = <Route exact path="/" component={ListView} key={0} />;
    let firstRoute = <Route exact path="/admin" component={ListView} key={1} />;
    let contentWrapperClass="";
    if (this.state.isAdmin) {
      if (this.state.sidebarOpen) {
        contentWrapperClass = " visible-sidebar";
      }
    }
    else {
      extraFirstRoute = [];
      firstRoute = <Route exact path="/admin" component={props=><LoginView
        setAdmin={this.setAdmin.bind(this)}
        {...props} />} />;
      contentWrapperClass=" login-view";
      topNav = [];
      sidebar = [];
    }
    if (this.state.redirect) {
      redirectElement = <Redirect to="/admin" />;
    }
    return (
      <Router basename={basename}>
        <div className="App">
          <div className="wrapper main-body">
            {topNav}
            {sidebar}
            <div className={"content-wrapper"+contentWrapperClass}>
              {redirectElement}
              <Switch>
                {extraFirstRoute}
                {firstRoute}
                <Route exact path="/admin/users" component={UsersListView} key={2} />,
                <Route exact path="/admin/item/:itemId" component={ItemView} key={3} />
              </Switch>
            </div>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
