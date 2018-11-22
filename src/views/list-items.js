import React, {Component} from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import {Redirect} from 'react-router';
import BreadCrumbs from '../components/breadcrumbs';
import {DropdownButton, MenuItem} from 'react-bootstrap';
import {APIPath, domain} from '../common/constants.js';
import Pagination from '../helpers/pagination.js';
import {loadProgressBar} from 'axios-progress-bar';
import ReactLoading from 'react-loading';
import {Modal} from 'react-bootstrap';
import {fixImagePath} from '../helpers/helpers';
import AdvancedSearchFormRow from '../components/advanced-search-row';

export class ListView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      firstLoad:true,
      loading: true,
      items: [],
      page: 1,
      current_page: 1,
      temp_page: 1,
      total: 0,
      paginate: 10,
      paginationHTML: [],
      length: 0,
      redirect: false,
      transcription_status_filter: null,
      user_filter: null,
      sort_col: 'id',
      sort_dir: 'desc',
      sort_key: 1,
      status: null,
      transcription_status: null,
      term: "",
      submit_search: false,
      sortingOptions: [
        {dir:"",icon: ""},
        {dir:"",icon: ""},
        {dir:"",icon: ""},
        {dir:"",icon: ""},
        {dir:"",icon: ""},
        {dir:"",icon: ""},
        {dir:"",icon: ""},
        {dir:"",icon: ""},
      ],
      showDeleteConfirm: false,
      deleteItemId: 0,
      deleteItemTitle: "",
      visibleSearch: "simple",
      advancedSearchBlocks: [],
      searchQuery: [],
      activeView: "list"
    };

    this.updatePage = this.updatePage.bind(this);
    this.updatePaginate = this.updatePaginate.bind(this);
    this.updateTranscriptionStatus = this.updateTranscriptionStatus.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.updateSort = this.updateSort.bind(this);
    this.toggleSortDir = this.toggleSortDir.bind(this);
    this.updatePageNumber = this.updatePageNumber.bind(this);
    this.pageNumberSubmit = this.pageNumberSubmit.bind(this);
    this.loadItems = this.loadItems.bind(this);
    this.loadSearchItems = this.loadSearchItems.bind(this);
    this.loadListItems = this.loadListItems.bind(this);
    this.listItemRow = this.listItemRow.bind(this);

    this.setSessionStorage = this.setSessionStorage.bind(this);
    this.checkSessionStorage = this.checkSessionStorage.bind(this);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleAdvancedSubmit = this.handleAdvancedSubmit.bind(this);
    this.showDeleteConfirm = this.showDeleteConfirm.bind(this);
    this.hideDeleteConfirm = this.hideDeleteConfirm.bind(this);
    this.deleteItem = this.deleteItem.bind(this);

    this.toggleVisibleSearch = this.toggleVisibleSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.addAdvancedSearchBlock = this.addAdvancedSearchBlock.bind(this);
    this.removeAdvancedSearchBlock = this.removeAdvancedSearchBlock.bind(this);
    this.updateSearchBlockValue = this.updateSearchBlockValue.bind(this);
    this.loadAdvancedSearchItems = this.loadAdvancedSearchItems.bind(this);
  }

  handleChange(event) {
    this.setState({
      term: event.target.value,
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.loadSearchItems();
  }

  handleAdvancedSubmit(e) {
    e.preventDefault();
    this.loadAdvancedSearchItems();
  }

  toggleCheckbox(e) {
    let value = true;
    if (e.target.value==="true") {
      value = false;
    }
    if (e.target.name==="search-letters") {
      this.setState({
        search_letters: value
      });
    }
    if (e.target.name==="search-content") {
      this.setState({
        search_content: value
      });
    }
  }

  updatePage(e) {
    if (e>0 && e!==this.state.current_page) {
      this.setState({
        loading:true,
        current_page: e,
        temp_page: e,
      });
    }
	}

  updatePaginate(value) {
    if (value!==this.state.paginate) {
      this.setState({
        paginate: value,
        loading: true
      });
    }
  }

  updateTranscriptionStatus(value) {
    if (value!==this.state.transcription_status) {
      this.setState({
        transcription_status: value
      });
    }
  }

  updateStatus(value) {
    if (value!==this.state.status) {
      this.setState({
        status: value
      });
    }
  }

  updateSort(value, key) {
    let newDirection = this.toggleSortDir(key);
    this.setState({
      sort_col: value['col'],
      sort_dir: newDirection,
      sort_key: key,
      loading: true
    });

  }

  toggleSortDir(key) {
    let currentSortingOption = this.state.sortingOptions[key];
    let newDirection = "";
    let newIcon = "";
    if (currentSortingOption.dir==="") {
      newDirection = "desc";
      newIcon = <i className="fa fa-caret-down"></i>;
    }
    else if (currentSortingOption.dir==="desc") {
      newDirection = "asc";
      newIcon = <i className="fa fa-caret-up"></i>;
    }
    let newSortingOptions = [
      {dir:"",icon: ""},
      {dir:"",icon: ""},
      {dir:"",icon: ""},
      {dir:"",icon: ""},
      {dir:"",icon: ""},
      {dir:"",icon: ""},
      {dir:"",icon: ""},
      {dir:"",icon: ""},
    ];
    newSortingOptions[key] = {dir: newDirection, icon: newIcon};
    this.setState({
      sortingOptions:newSortingOptions
    });
    return newDirection;
  }

  updatePageNumber(e) {
    this.setState({
      temp_page:e.target.value
    });
  }

  pageNumberSubmit(e) {
    e.preventDefault();
    let newPage = this.state.temp_page;
    if (parseInt(newPage,10)!==this.state.current_page) {
      this.setState({
        current_page: newPage,
        loading: true
      });
    }
  }

  loadItems() {
    if (this.state.activeView==="list") {
      this.loadListItems();
    }
    else if (this.state.activeView==="search"){
      this.loadSearchItems();
    }
    else if (this.state.activeView==="advanced"){
      this.loadAdvancedSearchItems();
    }
  }

  loadSearchItems() {
    this.setState({
      activeView: "search"
    })
    let context = this;
    let path = APIPath+"admin/search/"+this.state.term;
    let params = {
      sort_col: this.state.sort_col,
      sort_dir: this.state.sort_dir,
      page: this.state.current_page,
      paginate: this.state.paginate,
      status: this.state.status,
      transcription_status: this.state.transcription_status,
    };
    let accessToken = sessionStorage.getItem('adminAccessToken');
    axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
    axios.get(path, {
      params: params
    })
    .then(function (response) {
      let responseData = response.data.data;
      let itemsData = responseData.data;
      let items = [];
      for (let i=0; i<itemsData.length; i++) {
        let item = itemsData[i];
        let pageNumber = 0;
        let element = JSON.parse(item.element);
        let defaultThumbnail;

        if (typeof element.pages[pageNumber]!=="undefined") {
          let thumbPath = fixImagePath(domain+"/diyhistory/archive/square_thumbnails/"+element.pages[pageNumber].archive_filename);
          defaultThumbnail = <img className="img-thumbnail img-responsive" src={thumbPath} alt={element.title} />
        }
        let itemRow = {
          creator: element.creator,
          id: item.id,
          completed: 0,
          modified_timestamp: element.modified_timestamp,
          thumbnail: defaultThumbnail,
          title: element.title,
          titleText: element.title,
          source: element.source,
          status: element.status,
        }

        let browseItem = context.listItemRow(itemRow, i);
        items.push(browseItem);
      }
      if (items.length===0) {
        let empty = <tr key={0}><td colSpan={9} className="text-center"><i>There are no letters matching your search criteria</i></td></tr>;
        items.push(empty);
      }
      // update state
      let currentPage = responseData.current_page;
      if (responseData.last_page<responseData.current_page) {
        currentPage = responseData.last_page;
      }
      context.setState({
        loading:false,
        items: items,
        current_page: currentPage,
        last_page: responseData.last_page,
        total: responseData.total,
        submit_search: false,
        redirect: false
      });
    })
    .catch(function (error) {
      console.log(error);
      let responseData = error.response.data;
      let message = "";
      for (let k in responseData.errors) {
        message = responseData.errors[k];
      }
      if (message==="") {
        message = responseData.message;
      }
      context.setState({
        redirect: true,
      });
    });
  }

  loadListItems() {
    let context = this;
    let path = APIPath+"admin/list";
    let params = {
      sort_col: this.state.sort_col,
      sort_dir: this.state.sort_dir,
      page: this.state.current_page,
      paginate: this.state.paginate,
      status: this.state.status,
      transcription_status: this.state.transcription_status,
    };
    let accessToken = sessionStorage.getItem('adminAccessToken');
    axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
    axios.get(path, {
      params: params
    })
    .then(function (response) {
      let responseData = response.data.data;
      let itemsData = responseData.data;
      let items = [];
      for (let i=0; i<itemsData.length; i++) {
        let item = itemsData[i];
        let element = JSON.parse(item.element);
        let defaultThumbnail;

        if (typeof element.pages[0]!=="undefined") {
          let thumbPath = fixImagePath(domain+"/diyhistory/archive/square_thumbnails/"+element.pages[0].archive_filename);
          defaultThumbnail = <img className="img-thumbnail img-responsive" src={thumbPath} alt={element.title} />
        }

        let itemRow = {
          creator: element.creator,
          id: item.id,
          completed: item.completed+"%",
          modified_timestamp: element.modified_timestamp,
          thumbnail: defaultThumbnail,
          title: element.title,
          titleText: element.title,
          source: element.source,
          status: item.status,
          submit_search: false
        }

        let browseItem = context.listItemRow(itemRow, i);
        items.push(browseItem);
      }
      if (items.length===0) {
        let empty = <tr key={0}><td colSpan={9} className="text-center"><i>There are no letters matching your search criteria</i></td></tr>;
        items.push(empty);
      }
      // update state
      let currentPage = responseData.current_page;
      if (responseData.last_page<responseData.current_page) {
        currentPage = responseData.last_page;
      }
      context.setState({
        loading:false,
        items: items,
        current_page: currentPage,
        last_page: responseData.last_page,
        total: responseData.total,
        submit_search: false
      });
    })
    .catch(function (error) {
      let responseData = error.response.data;
      let message = "";
      for (let k in responseData.errors) {
        message = responseData.errors[k];
      }
      if (message==="") {
        message = responseData.message;
      }
      context.setState({
        redirect: true,
      });
    });
  }

  listItemRow(item,i) {
    let statusIcon = <i className="fa fa-minus-circle"></i>;
    //console.log(parseInt(item.status,10));
    if (parseInt(item.status,10)===1) {
      statusIcon = <i className="fa fa-check-circle"></i>;
    }
    let row = <tr key={i}>
      <td>{item.id}</td>
      <td style={{minWidth: "60px"}}>{item.thumbnail}</td>
      <td>{item.title}</td>
      <td className="text-center">{item.completed}</td>
      <td>{item.creator}</td>
      <td>{item.source}</td>
      <td className="text-center">{statusIcon}</td>
      <td>{item.modified_timestamp}</td>
      <td>
        <a href={"/item/"+item.id} target="_blank" className="btn btn-default btn-xs"><i className="fa fa-eye"></i></a>
        <Link to={"/admin/item/"+item.id} href={"/admin/item/"+item.id} className="btn btn-letters btn-xs"><i className="fa fa-pencil"></i></Link>
        <button className="btn btn-danger btn-xs" onClick={this.showDeleteConfirm.bind(this, item.id, item.titleText)}><i className="fa fa-trash"></i></button>
      </td>
    </tr>;
    return row;
  }

  checkSessionStorage() {
    if (sessionStorage.getItem('admin_search_items')!==null) {
      let storedState = JSON.parse(sessionStorage.getItem('admin_search_items'));
      let submitSearch = false;
      if (storedState.term.length>0) {
        submitSearch = true
      }
      this.setState({
        sort_col:storedState.sort_col,
        sort_dir:storedState.sort_dir,
        current_page:storedState.current_page,
        paginate:storedState.paginate,
        status: storedState.status,
        transcription_status: storedState.transcription_status,
        term: storedState.term,
        submit_search: submitSearch,
        visibleSearch: storedState.visibleSearch,
        activeView: storedState.activeView,
        advancedSearchBlocks: storedState.advancedSearchBlocks,
        searchQuery: storedState.searchQuery
      });
    }
  }

  setSessionStorage() {
    let newState = {
      sort_col: this.state.sort_col,
      sort_dir: this.state.sort_dir,
      current_page: this.state.current_page,
      paginate: this.state.paginate,
      status: this.state.status,
      transcription_status: this.state.transcription_status,
      term: this.state.term,
      visibleSearch: this.state.visibleSearch,
      activeView: this.state.activeView,
      advancedSearchBlocks: this.state.advancedSearchBlocks,
      searchQuery: this.state.searchQuery
    }
    sessionStorage.setItem('admin_search_items', JSON.stringify(newState));
  }

  showDeleteConfirm(itemId, itemTitle) {
    this.setState({
      showDeleteConfirm: true,
      deleteItemId: itemId,
      deleteItemTitle: itemTitle
    });
  }

  hideDeleteConfirm() {
    this.setState({
      showDeleteConfirm: false,
      deleteItemId: 0,
      deleteItemTitle: '',
    });
  }

  deleteItem() {
    let itemId = this.state.deleteItemId;
    if (itemId===0) {
      return false;
    }
    let context = this;
    let path = APIPath+"delete-letter";
    let accessToken = sessionStorage.getItem('adminAccessToken');
    let arrayData = {
      "id": parseInt(itemId,10),
    }
    axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
    axios({
      method: 'DELETE',
      url: path,
      data: arrayData,
      crossDomain: true,
    })
    .then(function (response) {
      if (response.data.status===true) {
        context.setState({
          showDeleteConfirm: false,
        });
        context.loadItems();
      }
      else {
        alert(response.data.errors);
      }

    })
    .catch(function (error) {
      console.log(error);
    });
  }

  toggleVisibleSearch() {
    let visibleSearch = "simple";
    if (this.state.visibleSearch==="simple") {
      visibleSearch = "advanced"
    }
    this.setState({
      visibleSearch: visibleSearch
    });
  }

  clearSearch() {
    let queryBlock = <AdvancedSearchFormRow
      key={0}
      itemKey={0}
      selectType="`element`->>'$.document_id'"
      addBlock={this.addAdvancedSearchBlock}
      removeBlock={this.removeAdvancedSearchBlock}
      update={this.updateSearchBlockValue}
    />;
    let queryBlocks = [];
    queryBlocks.push(queryBlock);
    let searchQuery = [{type: "`element`->>'$.document_id'", operator: "equals", value: "", boolean_operator: "and", key: 0}];
    this.setState({
      activeView: "list",
      advancedSearchBlocks: [],
      searchQuery: searchQuery,
      term: ""
    });
    let context = this;
    setTimeout(function() {
      context.setState({
        advancedSearchBlocks: queryBlocks,
      });
    },50);
  }

  addAdvancedSearchBlock(key) {
    let newAdvancedSearchBlocks = this.state.advancedSearchBlocks;
    let newKey = 0;
    newAdvancedSearchBlocks.forEach(function(row) {
      let rowKey = parseInt(row['key'],10);
      if (rowKey>newKey) {
        newKey = rowKey;
      }
    });
    newKey = newKey+1;

    let queryBlock = <AdvancedSearchFormRow
      key={newKey}
      itemKey={newKey}
      selectType="title"
      addBlock={this.addAdvancedSearchBlock}
      removeBlock={this.removeAdvancedSearchBlock}
      update={this.updateSearchBlockValue}
    />
    newAdvancedSearchBlocks.push(queryBlock);
    this.setState({
      advancedSearchBlocks: newAdvancedSearchBlocks,
    });
  }

  removeAdvancedSearchBlock(key) {
    if (this.state.advancedSearchBlocks.length===1) {
      return false;
    }
    let stateAdvancedSearchBlocks = this.state.advancedSearchBlocks;
    let newAdvancedSearchBlocks = [];
    stateAdvancedSearchBlocks.forEach(function(row) {
      if (parseInt(row['key'],10)!==key) {
        newAdvancedSearchBlocks.push(row);
      }
    });

    let stateSearchQuery = this.state.searchQuery;
    let newSearchQuery = [];
    stateSearchQuery.forEach(function(row) {
      if (parseInt(row['key'],10)!==key) {
        newSearchQuery.push(row);
      }
    });
    this.setState({
      advancedSearchBlocks: newAdvancedSearchBlocks,
      searchQuery: newSearchQuery
    });
  }

  updateSearchBlockValue(data, key) {
    let searchQuery = this.state.searchQuery;
    let newSearchQuery = [];
    let exists = false;
    searchQuery.forEach(function(row) {
      if (parseInt(row['key'],10)===key) {
        row = data;
        exists = true;
      }
      newSearchQuery.push(row);
    });
    if (!exists) {
      newSearchQuery.push(data);
    }
    this.setState({
      searchQuery: newSearchQuery
    })
  }

  loadAdvancedSearchItems() {
    this.setState({
      activeView: "advanced"
    })
    let newQuery = [];
    let stateQuery = this.state.searchQuery;
    stateQuery.forEach(function(row) {
      if (typeof row!=="undefined") {
        newQuery.push(row);
      }
    })
    let context = this;
    let path = APIPath+"admin/advanced-search/";
    let params = {
      sort_col: this.state.sort_col,
      sort_dir: this.state.sort_dir,
      page: this.state.current_page,
      paginate: this.state.paginate,
      status: this.state.status,
      transcription_status: this.state.transcription_status,
      query: newQuery
    };

    let accessToken = sessionStorage.getItem('adminAccessToken');
    axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
    axios.get(path, {
      params: params
    })
    .then(function (response) {
      let responseData = response.data.data;
      let itemsData = responseData.data;
      let items = [];
      let currentPage = context.state.current_page;
      if (typeof itemsData!=="undefined") {

        for (let i=0; i<itemsData.length; i++) {
          let item = itemsData[i];
          let pageNumber = 0;
          let element = JSON.parse(item.element);
          let defaultThumbnail;

          if (typeof element.pages[pageNumber]!=="undefined") {
            let thumbPath = fixImagePath(domain+"/diyhistory/archive/square_thumbnails/"+element.pages[pageNumber].archive_filename);
            defaultThumbnail = <img className="img-thumbnail img-responsive" src={thumbPath} alt={element.title} />
          }
          let itemRow = {
            creator: element.creator,
            id: item.id,
            completed: 0,
            modified_timestamp: element.modified_timestamp,
            thumbnail: defaultThumbnail,
            title: element.title,
            titleText: element.title,
            source: element.source,
            status: element.status,
          }

          let browseItem = context.listItemRow(itemRow, i);
          items.push(browseItem);
        }
        // update state
        currentPage = responseData.current_page;
        if (responseData.last_page<responseData.current_page) {
          currentPage = responseData.last_page;
        }
      }
      else {
        let empty = <tr key={0}><td colSpan={9} className="text-center"><i>There are no letters matching your search criteria</i></td></tr>;
        items.push(empty);
      }

      context.setState({
        loading:false,
        items: items,
        current_page: currentPage,
        last_page: responseData.last_page,
        total: responseData.total,
        submit_search: false,
        redirect: false
      });

    })
    .catch(function (error) {
      console.log(error);
      let responseData = error.response.data;
      let message = "";
      for (let k in responseData.errors) {
        message = responseData.errors[k];
      }
      if (message==="") {
        message = responseData.message;
      }
      context.setState({
        redirect: true,
      });
    });

  }

  componentDidMount() {
    let queryBlock = <AdvancedSearchFormRow
      key={0}
      itemKey={0}
      selectType="`element`->>'$.document_id'"
      addBlock={this.addAdvancedSearchBlock}
      removeBlock={this.removeAdvancedSearchBlock}
      update={this.updateSearchBlockValue}
    />;
    let queryBlocks = [];
    queryBlocks.push(queryBlock);
    let searchQuery = [{type: "`element`->>'$.document_id'", operator: "equals", value: "", boolean_operator: "and", key: 0}];
    loadProgressBar();
    this.checkSessionStorage();
    if (this.state.firstLoad) {
      this.setState({
        firstLoad: false,
        advancedSearchBlocks: queryBlocks,
        searchQuery: searchQuery
      });
      let context = this;
      setTimeout(function() {
        context.loadListItems();
      },1500);

    }
    else {
      this.loadListItems();
    }


  }

  componentDidUpdate(prevProps, prevState) {
    if (
      (this.state.submit_search && !prevState.submit_search)
      || prevState.current_page!==this.state.current_page
      || prevState.paginate!==this.state.paginate
      || prevState.status!==this.state.status
      || prevState.transcription_status!==this.state.transcription_status
      || (prevState.sort_col!==this.state.sort_col || prevState.sort_dir!==this.state.sort_dir)
      || prevState.activeView!==this.state.activeView
    ) {
      this.setSessionStorage();
      let context = this;
      setTimeout(function() {
        context.loadItems();
      },500);
    }
  }

  render() {
    let redirectElement;
    if (this.state.redirect) {
      redirectElement = <Redirect to="/admin" />;
    }
    let contentTitle = 'Items';
    let breadCrumbsArr = [{label:contentTitle,path:''}];
    let contentHTML = [];
    let sessionActive = sessionStorage.getItem('adminSessionActive');
    if (sessionActive!=='true') {
      contentHTML = <div className="item-container">
        <p className="text-center">This is a protected page. <br/>To view this page you must first login or register.</p>
      </div>;
    }
    else if (this.state.redirect) {
      contentHTML = <Redirect to="/admin/items"  />;
    }

    let searchFormStyle = {
      margin: "20px 0 0 0"
    }
    let searchform;
    if (this.state.visibleSearch==="simple") {
      searchform = <div style={searchFormStyle}>
          <form name="general-search-input" onSubmit={this.handleSubmit}>
            <div className="input-group">
              <input onChange={this.handleChange} value={this.state.term} name="search-bar" type="text" className="form-control" placeholder="Admin Search Items" />
              <span className="input-group-btn">
                <button className="btn btn-letters" onClick={this.handleSubmit} type="button" id="search-letters-submit">Search</button>
              </span>
            </div>
            <div className="search-checkboxes">
            </div>
          </form>

          <button type="button" className="btn btn-default btn-xs pull-left" style={{marginTop: "15px"}} onClick={this.clearSearch}><i className="fa fa-times-circle"></i> Clear search</button>
          <button type="button" className="btn btn-default btn-xs pull-right" style={{marginTop: "15px"}} onClick={this.toggleVisibleSearch}>Advanced search</button>
        </div>;
    }


    if (this.state.visibleSearch==="advanced") {

      searchform = <div style={searchFormStyle}>
          <form onSubmit={this.handleAdvancedSubmit}>
            <div>
              {this.state.advancedSearchBlocks}
            </div>

            <div className="text-center">
              <button type="submit" className="btn btn-letters" style={{marginTop: "15px"}}>Submit search</button>
            </div>
          </form>

          <button type="button" className="btn btn-default btn-xs pull-left" style={{marginTop: "15px"}} onClick={this.clearSearch}><i className="fa fa-times-circle"></i> Clear search</button>
          <button type="button" className="btn btn-default btn-xs pull-right" style={{marginTop: "15px"}} onClick={this.toggleVisibleSearch}>Simple search</button>
        </div>;
    }

    let paginate10Active="",paginate25Active="",paginate50Active="";
    if (this.state.paginate===10) {
      paginate10Active = "active";
    }
    if (this.state.paginate===25) {
      paginate25Active = "active";
    }
    if (this.state.paginate===50) {
      paginate50Active = "active";
    }

    let tStatusActive1="",tStatusActive2="",tStatusActive3="",tStatusActive4="",tStatusActive5="";
    if (this.state.transcription_status===null) {
      tStatusActive1="active";
    }
    if (this.state.transcription_status===-1) {
      tStatusActive2="active";
    }
    if (this.state.transcription_status===0) {
      tStatusActive3="active";
    }
    if (this.state.transcription_status===1) {
      tStatusActive4="active";
    }
    if (this.state.transcription_status===2) {
      tStatusActive5="active";
    }

    let statusActive1="",statusActive2="",statusActive3="";
    if (this.state.status===null) {
      statusActive1="active";
    }
    if (this.state.status===0) {
      statusActive2="active";
    }
    if (this.state.status===1) {
      statusActive3="active";
    }

    let paginationHTML = <div className="browse-filters">
      <DropdownButton
        title="Status"
        id="status-filter"
        >
        <MenuItem key="1" onClick={this.updateStatus.bind(this,null)} className={statusActive1}>All</MenuItem>
        <MenuItem key="2" onClick={this.updateStatus.bind(this,0)} className={statusActive2}>Not published</MenuItem>
        <MenuItem key="3" onClick={this.updateStatus.bind(this,1)} className={statusActive3}>Published</MenuItem>
      </DropdownButton>

      <DropdownButton
        title="Transcription status"
        id="transcription-status-filter"
        >

        <MenuItem key="1" onClick={this.updateTranscriptionStatus.bind(this,null)} className={tStatusActive1}>All</MenuItem>

        <MenuItem key="2" onClick={this.updateTranscriptionStatus.bind(this,-1)} className={tStatusActive2}>Not available for transcription</MenuItem>

        <MenuItem key="3" onClick={this.updateTranscriptionStatus.bind(this,0)} className={tStatusActive3}>Open for transcription</MenuItem>

        <MenuItem key="4" onClick={this.updateTranscriptionStatus.bind(this,1)} className={tStatusActive4}>Completed</MenuItem>

        <MenuItem key="5" onClick={this.updateTranscriptionStatus.bind(this,2)} className={tStatusActive5}>Approved</MenuItem>

      </DropdownButton>

      <DropdownButton
        title="Limit"
        id="limit-filter"
        >
        <MenuItem key="1" onClick={this.updatePaginate.bind(this,10)} className={paginate10Active}>10</MenuItem>
        <MenuItem key="2" onClick={this.updatePaginate.bind(this,25)} className={paginate25Active}>25</MenuItem>
        <MenuItem key="3" onClick={this.updatePaginate.bind(this,50)} className={paginate50Active}>50</MenuItem>
      </DropdownButton>

      <Pagination
          paginate={this.state.paginate}
          current_page={this.state.current_page}
          total_pages={this.state.last_page}
          pagination_function={this.updatePage} />

      <form onSubmit={this.pageNumberSubmit} className="pagination-form">
        <div className="input-group input-group-sm go-to-page">
          <input className="form-control" name="go-to-page" onChange={this.updatePageNumber} value={this.state.temp_page}/>
          <span className="input-group-addon">/ {this.state.last_page}</span>
          <span className="input-group-btn">
            <button type="submit" className="btn btn-default btn-flat"><i className="fa fa-chevron-right"></i></button>
          </span>
        </div>
      </form>

    </div>;

    // sort filters
    let itemsHTML;

    if (this.state.loading) {
      itemsHTML = <tr>
        <td colSpan={9} className="text-center">
          <div className="loader-container">
            <ReactLoading type='spinningBubbles' color='#738759' height={60} width={60} delay={0} />
          </div>
        </td>
      </tr>;
    }
    else {
      itemsHTML = this.state.items;
    }

    contentHTML = <div>
    {searchform}
    <div className="row">
      <div className="col-xs-12">
        {paginationHTML}
          <div className="item-container table-responsive no-padding">
            <table className="table table-hover sortable-table">
              <thead>
                <tr>
                  <th onClick={this.updateSort.bind(this,{"col":"entry.id","direction":this.state.sortingOptions[0]},0)} style={{width: "40px"}}>ID {this.state.sortingOptions[0].icon}</th>
                  <th style={{width: "60px"}}></th>
                  <th onClick={this.updateSort.bind(this,{"col":"element->title","direction":this.state.sortingOptions[1]},1)}>Title {this.state.sortingOptions[1].icon}</th>
                  <th onClick={this.updateSort.bind(this,{"col":"completed","direction":this.state.sortingOptions[2]},2)} style={{width: "120px"}}>Completed {this.state.sortingOptions[2].icon}</th>
                  <th onClick={this.updateSort.bind(this,{"col":"element->creator","direction":this.state.sortingOptions[3]},3)} style={{width: "100px"}}>Creator {this.state.sortingOptions[3].icon}</th>
                  <th onClick={this.updateSort.bind(this,{"col":"element->source","direction":this.state.sortingOptions[4]},4)} style={{width: "130px"}}>Contributor {this.state.sortingOptions[4].icon}</th>
                  <th onClick={this.updateSort.bind(this,{"col":"status","direction":this.state.sortingOptions[5]},5)} style={{width: "100px"}}>Public {this.state.sortingOptions[5].icon}</th>
                  <th onClick={this.updateSort.bind(this,{"col":"element->modified_timestamp","direction":this.state.sortingOptions[6]},6)} style={{width: "40px"}}>Date Added {this.state.sortingOptions[6].icon}</th>
                  <th style={{width: "40px"}}></th>
                </tr>
              </thead>
              <tbody>
                {itemsHTML}
              </tbody>
            </table>
          </div>
        {paginationHTML}
      </div>
    </div>
  </div>;


    return (
      <div className="admin-container">
        {redirectElement}
        <div className="row">
          <div className="col-xs-12 col-sm-6 pull-right">
            <BreadCrumbs items={breadCrumbsArr}/>
          </div>
          <div className="col-xs-12 col-sm-6">
            <h1><span>{contentTitle}</span></h1>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            {contentHTML}
          </div>
        </div>

        <Modal
          show={this.state.showDeleteConfirm}
          onHide={this.hideDeleteConfirm}
          bsSize="small"
          >
            <Modal.Header closeButton>
              <Modal.Title>Delete Item</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {"The item \""+this.state.deleteItemTitle+"\" will be deleted. This action cannot be undone. Continue?"}
            </Modal.Body>
            <Modal.Footer>
              <button type="button" className="pull-left btn btn-primary btn-sm" onClick={this.hideDeleteConfirm}>Cancel</button>
              <button className="btn btn-danger pull-right btn-sm" type="button" onClick={this.deleteItem}><i className="fa fa-trash-o"></i> Delete</button>
            </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
