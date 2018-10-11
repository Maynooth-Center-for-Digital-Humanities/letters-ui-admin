import React, {Component} from 'react';
import axios from 'axios';
import {Redirect} from 'react-router-dom';
import ReactLoading from 'react-loading';
import {loadProgressBar} from 'axios-progress-bar';

import {APIPath} from '../common/constants';
import {Tabs,Tab} from 'react-bootstrap';
import BreadCrumbs from '../components/breadcrumbs';
import ItemAdmin from '../components/item-admin';
import ItemForm from '../components/item-form';
import ItemPages from '../components/item-pages';

export class ItemView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      item: [],
      loadItem: false,
      redirect: false,
    };
    this.loadItem = this.loadItem.bind(this);
    this.handleLoadItem = this.handleLoadItem.bind(this);
    this.updateStatePages = this.updateStatePages.bind(this);
  }

  loadItem() {
    let itemId = this.props.match.params.itemId;
    let context = this;
    let path = APIPath+"admin/user-letter/"+itemId;
    let accessToken = sessionStorage.getItem('adminAccessToken');
    axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
    axios.get(path)
    .then(function (response) {
      let itemData = response.data.data;
      context.setState({
        loading: false,
        item: itemData,
        loadItem: false,
      })
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  handleLoadItem() {
    this.setState({
      loadItem: true
    });
  }

  updateStatePages(newPages) {
    let newItem = Object.assign({}, this.state.item);
    newItem.pages = newPages;
    this.setState({
      item: newItem
    });
  }

  componentDidMount() {
    this.loadItem();
    loadProgressBar();
  }

  componentWillUnmount() {
    this.setState({loading:true});
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.loadItem!==this.state.loadItem && this.state.loadItem===true) {
      this.loadItem();
    }
    if (prevProps.match.params.itemId!==this.props.match.params.itemId) {
      this.setState({
        loading: true,
        loadItem: true
      })
    }
  }

  render() {
    let redirectElement;
    if (this.state.redirect) {
      redirectElement = <Redirect to="/admin" />;
    }
    const itemId = this.props.match.params.itemId;
    let pageTitle = 'Edit Item';
    if (parseInt(itemId,10)===0) {
      pageTitle = 'Add new item';
    }
    let breadCrumbsArr = [{label: pageTitle,path:''}];
    let content;
    if (this.state.loading) {
      content = <div className="item-container">
          <div className="loader-container item-loader">
            <ReactLoading type='spinningBubbles' color='#738759' height={60} width={60}  delay={0} />
          </div>
        </div>;
    }
    else {
      content = <div className="item-container">

        <Tabs defaultActiveKey={1} id="tabs">
           <Tab eventKey={1} key={1} title="Admin">
            <ItemAdmin id={itemId} item={this.state.item} handleLoadItem={this.handleLoadItem} />
           </Tab>
           <Tab eventKey={2} key={2} title="Metadata">
            <ItemForm id={itemId} item={this.state.item}/>
           </Tab>
           <Tab eventKey={3} key={3} title="Pages">
            <ItemPages id={itemId} pages={this.state.item.pages} handleLoadItem={this.handleLoadItem} updateStatePages={this.updateStatePages}/>
           </Tab>
        </Tabs>

      </div>;
    }
    return (
      <div className="admin-container item-view" id="transcription-container">
        {redirectElement}
        <div className="row">
          <div className="col-xs-12 col-sm-6 pull-right">
            <BreadCrumbs items={breadCrumbsArr}/>
          </div>
          <div className="col-xs-12 col-sm-6">
            <h1><span>Edit item</span></h1>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            {content}
          </div>
        </div>
      </div>
    );
  }
}
