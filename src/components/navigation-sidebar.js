import React, { Component } from 'react';
import {Link} from 'react-router-dom';


export class NavigationSidebar extends Component {

  render() {
    let openClass = " open";
    if (!this.props.sidebarOpen) {
      openClass = "";
    }
    let itemsActive="",usersActive="";
    if (window.location.pathname==="/admin" || window.location.pathname==="/admin/" || window.location.pathname.indexOf("/admin/item")>-1 ) {
      itemsActive = "active";
    }
    if (window.location.pathname==="/admin/users") {
      usersActive = "active";
    }
    return (
      <div className={"sidenav"+openClass}>
        <Link to="/admin" href="/admin" className={itemsActive}>Items</Link>
        <Link to="/admin/users" href="/admin/users" className={usersActive}>Users</Link>
      </div>
    )
  }
}
