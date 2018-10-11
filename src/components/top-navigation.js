import React, { Component } from 'react';
import {Navbar, Nav, NavDropdown, MenuItem} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import logoSmall from '../assets/images/logo-stamp-small.png';
import {sessionCookie} from '../helpers/helpers';
import axios from 'axios';

import {APIPath} from '../common/constants';


export class TopNavigation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: ''
    }
    this.handleLogout = this.handleLogout.bind(this);
  }

  handleLogout() {
    let context = this;
    let accessToken = sessionStorage.getItem('adminAccessToken');
    axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
    axios.get(APIPath+'logout')
    .then(function (response) {
      sessionStorage.setItem('adminSessionActive', false);
  		sessionStorage.setItem('adminAccessToken', '');
  		sessionStorage.setItem('adminUserName', '');
  		sessionCookie('', false, '', true);
      context.props.setAdmin(false);

      window.location = window.location.host+"/admin";
    })
    .catch(function (error) {
      console.log(error);
    });


	}

  componentDidMount() {
    let userName = this.state.userName;
    if (userName!==sessionStorage.getItem('adminUserName')) {
      userName = sessionStorage.getItem('adminUserName');
      this.setState({
        userName: userName
      });
    }
  }

  componentDidUpdate() {
    let userName = this.state.userName;
    if (userName!==sessionStorage.getItem('adminUserName')) {
      userName = sessionStorage.getItem('adminUserName');
      this.setState({
        userName: userName
      });
    }
  }

  render() {
    let brandClass = " open";
    if (!this.props.sidebarOpen) {
      brandClass = "";
    }
    let userName = this.state.userName;
		let dropdownTitle = <span><i className="fa fa-user-circle"></i> {userName}</span>;

    return(
      <Navbar staticTop className="top-nav">
        <Navbar.Header className={brandClass}>
          <Navbar.Brand>
            <Link href="/" to="/">
              <img src={logoSmall} alt="" className="logo-small" />
              <span className="logo-text">Letters 1916-1923</span>
            </Link>
          </Navbar.Brand>
        </Navbar.Header>
        <span className={"toggle-sidebar"+brandClass} onClick={this.props.toggleSidebar}>
          <i className="fa fa-bars"></i>
        </span>
        <Nav pullRight className="pull-right">
          <NavDropdown eventKey={1} title={dropdownTitle} id="user-dropdown">
            <MenuItem eventKey={1.1} onClick={this.handleLogout}><i className="fa fa-sign-out"></i> Logout</MenuItem>
          </NavDropdown>
        </Nav>
      </Navbar>
    );
  }
}
