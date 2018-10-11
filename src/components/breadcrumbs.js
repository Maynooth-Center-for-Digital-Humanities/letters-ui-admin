import React from 'react';
import {Link} from 'react-router-dom';

class BreadCrumbs extends React.Component {
  render() {
    let items = this.props.items;
    let itemsHTML = [];
    for (let i=0; i<items.length; i++) {
      let item = items[i];
      let path = item.path;
      let label = item.label;
      let link = label;
      if (path.length>0) {
        link = <Link to={path} href={path}>{label}</Link>;
      }
      var listItem = <li key={i}>{link}</li>;
      itemsHTML.push(listItem);
    }
    return (
      <div className="breadcrumbs-container">
        <ul className="breadcrumbs-list">
          <li><Link to="/admin/" href="/admin/"><i className="fa fa-home"></i> Home</Link></li>
          {itemsHTML}
        </ul>
      </div>
    );
  }
}

export default BreadCrumbs;
