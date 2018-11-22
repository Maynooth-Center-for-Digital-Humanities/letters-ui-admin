import React, {Component} from 'react';
import axios from 'axios';
import {Redirect} from 'react-router';
import BreadCrumbs from '../components/breadcrumbs';
import {Modal, DropdownButton, MenuItem} from 'react-bootstrap';
import {APIPath} from '../common/constants.js';
import Pagination from '../helpers/pagination.js';
import {loadProgressBar} from 'axios-progress-bar';
import ConfirmModal from '../components/confirm-modal';

export class UsersListView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      items: [],
      userGroupsFilter:[],
      userGroupsFilterText: 'All groups',
      userGroupsFilterId: 0,
      page: 1,
      current_page: 1,
      temp_page: 1,
      total: 0,
      sort: "desc",
      paginate: 10,
      paginationHTML: [],
      length: 0,
      letterName: '',
      showdeleteUserConfirm:false,
      showBtnDisabledConfirm: false,
      btnDisabledText: '',
      redirect: false,
      showUserModal: false,
      userModalLoading: false,
      userModalHeaderText: false,
      user_id: 0,
      user_name: '',
      user_email: '',
      user_status: 0,
      user_role: 0,
      usergroupOptions: [],
      form_saving: false,
      searchTerm: "",
      searchTypeTitle: "Name",
      deleting: false,
      userRolesModal: false,
      userRolesModalLoading: true,
      modalUserRoles: [],
      showEditUserGroupForm: false,
      usergroupLoading: true,
      usergroup_id: 0,
      usergroup_name: '',
      usergroup_description: '',
      usergroup_default: 0,
      usergroupSaveStatus: false,
      usergroupDeleteStatus: false,
      usergroupDeleteError: false,
      usergroupDeleteErrorText: '',

    };

    this.updatePage = this.updatePage.bind(this);
    this.updatePaginate = this.updatePaginate.bind(this);
    this.updateSort = this.updateSort.bind(this);
    this.updatePageNumber = this.updatePageNumber.bind(this);
    this.pageNumberSubmit = this.pageNumberSubmit.bind(this);
    this.loadItems = this.loadItems.bind(this);
    this.loadUserGroups = this.loadUserGroups.bind(this);
    this.loadUserGroup = this.loadUserGroup.bind(this);
    this.deleteUserGroup = this.deleteUserGroup.bind(this);
    this.parseItems = this.parseItems.bind(this);
    this.showDeleteUserConfirmModal = this.showDeleteUserConfirmModal.bind(this);
    this.hideDeleteUserConfirmModal = this.hideDeleteUserConfirmModal.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.showBtnDisabledConfirm = this.showBtnDisabledConfirm.bind(this);
    this.hideBtnDisabledConfirm = this.hideBtnDisabledConfirm.bind(this);
    this.loadUser = this.loadUser.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
    this.showUserModal = this.showUserModal.bind(this);
    this.hideUserModal = this.hideUserModal.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.updateUserSearchType = this.updateUserSearchType.bind(this);
    this.userSearch = this.userSearch.bind(this);
    this.showUserRolesModal = this.showUserRolesModal.bind(this);
    this.hideUserRolesModal = this.hideUserRolesModal.bind(this);
    this.showEditUserGroup = this.showEditUserGroup.bind(this);
    this.hideEditUserGroup = this.hideEditUserGroup.bind(this);
    this.handleUserGroupFormSubmit = this.handleUserGroupFormSubmit.bind(this);
    this.updateUserGroupsFilter = this.updateUserGroupsFilter.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
  }


  handleFormChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleFormSubmit(event) {
		event.preventDefault();
    if (this.state.form_saving) {
      return false;
    }
    this.setState({
      form_saving: true
    });
		var context = this;
    let accessToken = sessionStorage.getItem('adminAccessToken');
    axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
		axios.post(APIPath+'admin/user/'+this.state.user_id, {
			email: this.state.user_email,
			name: this.state.user_name,
			status: this.state.user_status,
			role: this.state.user_role,
		})
	  .then(function (response) {
	    //let responseData = response.data;
      context.setState({
        form_saving: false,
        showUserModal: false,
      });
      context.loadItems();
	  })
	  .catch(function (error) {
	    console.log(error);
	  });
  }

  handleUserGroupFormSubmit(e) {
    e.preventDefault();
    if (this.state.usergroupSaveStatus) {
      return false;
    }
    this.setState({
      usergroupSaveStatus: true
    });
    let context = this;
    let path = APIPath+"admin/available-user-role/"+this.state.usergroup_id;
    let accessToken = sessionStorage.getItem('adminAccessToken');
    axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
    axios.post(path, {
      name: this.state.usergroup_name,
      description: this.state.usergroup_description,
      default: this.state.usergroup_default
    })
    .then(function (response) {
      //let responseData = response.data.data;
      context.setState({
        usergroupSaveStatus: false,
        showEditUserGroupForm: false
      });
      context.loadUserGroups();
    })
    .catch(function (error) {
      console.log(error);
    });
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

  updateSort(value) {
    if (value!==this.state.sort) {
      this.setState({
        sort: value,
        loading: true
      });
    }
  }

  updatePageNumber(e) {
    this.setState({
      temp_page:e.target.value
    });
  }

  updateUserGroupsFilter(id, name) {
    console.log(id, name);
    this.setState({
      userGroupsFilterText: name,
      userGroupsFilterId: id,
      loading: true
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

  loadUser(id) {
    if (parseInt(id,10)>0) {
      let context = this;
      let path = APIPath+"admin/user/"+id;
      let accessToken = sessionStorage.getItem('adminAccessToken');
      axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
      axios.get(path)
      .then(function (response) {
        let responseData = response.data.data;
        let userRole = 0;

        if (responseData.roles.length>0) {
          userRole = responseData.roles[0].id;
        }
        context.setState({
          user_id: parseInt(id,10),
          user_name: responseData.name,
          user_email: responseData.email,
          user_status: responseData.status,
          userModalLoading:false,
          user_role: userRole
        });
      })
      .catch(function (error) {
        console.log(error);
      });
    }
    else {
      this.setState({
        user_id: 0,
        user_name: '',
        user_email: '',
        user_status: 0,
        userModalLoading:false,
      });
    }
  }

  loadItems() {
    let context = this;
    let path = APIPath+"admin/users/";
    let params = {
      sort: this.state.sort,
      page: this.state.current_page,
      paginate: this.state.paginate,
      term: this.state.searchTerm,
      type: this.state.searchTypeTitle,
      group: this.state.userGroupsFilterId
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
      if (typeof itemsData!=="undefined" && itemsData.length>0) {
        items = context.parseItems(itemsData);
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
        total: responseData.total
      });
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  loadUserGroups() {
    let context = this;
    let path = APIPath+"admin/available-user-roles/";
    let accessToken = sessionStorage.getItem('adminAccessToken');
    axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
    axios.get(path)
    .then(function (response) {
      let responseData = response.data.data;
      let usergroupOptions = [];
      usergroupOptions.push(<option value={0} key={0}>--</option>);
      let usergroupAvailableOptions = responseData.map(item => <option key={item.id} value={item.id}>{item.name}</option>);
      usergroupOptions.push(usergroupAvailableOptions);
      let userGroupsFilter = [];
      userGroupsFilter.push(<MenuItem key={0} onClick={context.updateUserGroupsFilter.bind(this,0, "All groups")}>All user groups</MenuItem>);
      let modalUserRoles = [];
      for (let i=0; i<responseData.length; i++) {
        let modalUserRole = responseData[i];
        let editIcon = <button type="button" className="btn btn-xs btn-letters" onClick={context.showEditUserGroup.bind(this, modalUserRole.id)}><i className="fa fa-pencil"></i></button>;
        let isAdminIcon = <i className="fa fa-minus-circle"></i>;
        let isDefaultIcon = <i className="fa fa-minus-circle"></i>;
        if (parseInt(modalUserRole.is_admin,10)===1) {
          isAdminIcon = <i className="fa fa-check-circle"></i>;
          editIcon = [];
        }
        if (parseInt(modalUserRole.default,10)===1) {
          isDefaultIcon = <i className="fa fa-check-circle"></i>;
        }
        let count = i+1;
        let row = <tr key={i}>
          <td>{count}</td>
          <td>{modalUserRole.id}</td>
          <td>{modalUserRole.name}<br/><i><small>{modalUserRole.description}</small></i></td>
          <td className="text-center">{isAdminIcon}</td>
          <td className="text-center">{isDefaultIcon}</td>
          <td className="text-center">{editIcon}</td>
        </tr>;
        modalUserRoles.push(row);
        let userGroupFilter = <MenuItem key={count} onClick={context.updateUserGroupsFilter.bind(this,modalUserRole.id,modalUserRole.name)}>{modalUserRole.name}</MenuItem>;

        userGroupsFilter.push(userGroupFilter);
      }
      context.setState({
        usergroupOptions:usergroupOptions,
        modalUserRoles: modalUserRoles,
        userRolesModalLoading: false,
        userGroupsFilter: userGroupsFilter
      });
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  loadUserGroup(id) {
    this.setState({
      showEditUserGroupForm: true,
      usergroupLoading: true,
      usergroupDeleteError: false
    });
    let context = this;
    let path = APIPath+"admin/available-user-role/"+id;
    let accessToken = sessionStorage.getItem('adminAccessToken');
    axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
    axios.get(path)
    .then(function (response) {
      let responseData = response.data.data;

      context.setState({
        usergroup_id: responseData.id,
        usergroup_name: responseData.name,
        usergroup_description: responseData.description,
        usergroup_default: responseData.default,
        usergroupLoading: false
      });
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  deleteUserGroup() {
    if (this.state.usergroupDeleteStatus) {
      return false;
    }
    this.setState({
      usergroupDeleteStatus: true,
    });
    let context = this;
    let path = APIPath+"admin/available-user-role/"+this.state.usergroup_id;
    let accessToken = sessionStorage.getItem('adminAccessToken');
    axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
    axios.delete(path)
    .then(function (response) {
      if (response.data.status===true) {
        context.setState({
          usergroupDeleteStatus: false,
          showEditUserGroupForm: false,
        });
        context.loadUserGroups();
      }
      else if (response.data.status===false) {
        context.setState({
          usergroupDeleteStatus: false,
          usergroupDeleteError: true,
          usergroupDeleteErrorText: response.data.errors,
        });

      }

    })
    .catch(function (error) {
      console.log(error);
    });
  }

  showEditUserGroup(id) {
    if (parseInt(id,10)===0) {
      this.setState({
        usergroupDeleteError: false,
        showEditUserGroupForm: true,
        usergroupLoading: false,
        usergroup_id: 0,
        usergroup_name: '',
        usergroup_description: '',
        usergroup_default: 0,
      });
    }
    else if (parseInt(id,10)>0) {
      this.loadUserGroup(id);
    }

  }

  hideEditUserGroup() {
    this.setState({
      showEditUserGroupForm: false
    });
  }

  parseItems(itemsData) {
    // list of items to display
    let items = [];
    for (let i=0; i<itemsData.length; i++) {
      let item = itemsData[i];
      let count = i+1+(parseInt(this.state.paginate,10)*(parseInt(this.state.current_page,10)-1));

      let statusBtn = <i className="fa fa-check-circle"></i>;
      if (parseInt(item.status,10)===0) {
        statusBtn = <i className="fa fa-minus-circle"></i>;
      }
      let viewItem = <tr data-id={item.id} key={i}>
        <td style={{width: '40px'}}>{count}</td>
        <td style={{width: '40px'}}>{item.id}</td>
        <td>{item.name}</td>
        <td>{item.email}</td>
        <td>{item.created_at}</td>
        <td style={{width: '40px', textAlign: 'center'}}>{statusBtn}</td>
        <td style={{width: '40px', textAlign: 'center'}}><button type="button" className="btn btn-letters btn-xs" onClick={this.showUserModal.bind(this, item.id)}><i className="fa fa-pencil"></i></button></td>
      </tr>;
      items.push(viewItem);
    }
    return items;
  }

  showDeleteUserConfirmModal() {
    this.setState({
      showdeleteUserConfirm: true,
    });
  }

  hideDeleteUserConfirmModal() {
    this.setState({
      showdeleteUserConfirm: false
    });
  }

  deleteUser() {
    let userId = this.state.user_id;
    if (userId>0) {
      let context = this;
      let path = APIPath+"admin/user/"+userId;
      let accessToken = sessionStorage.getItem('adminAccessToken');
      axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
      axios.delete(path)
      .then(function (response) {
        context.setState({
          showdeleteUserConfirm: false,
          showUserModal: false
        });
        context.loadItems();
      })
      .catch(function (error) {
        console.log(error);
      });
    }
  }

  showBtnDisabledConfirm(text) {
    this.setState({
      showBtnDisabledConfirm: true,
      btnDisabledText: text,
    });
  }

  hideBtnDisabledConfirm() {
    this.setState({
      showBtnDisabledConfirm: false,
      btnDisabledText: "",
    });
  }

  showUserModal(id) {
    if (parseInt(id,10)===0) {
      this.setState({
        userModalHeaderText: "Add new user",
        showUserModal: true,
        userModalLoading:true,
      });
    }
    else if (parseInt(id,10)>0) {
      this.setState({
        userModalHeaderText: "Edit user",
        showUserModal: true,
        userModalLoading:true,
      });
    }
    this.loadUser(id);
  }

  hideUserModal() {
    this.setState({
      showUserModal: false
    })
  }

  updateUserSearchType(value) {
    this.setState({
      searchTypeTitle: value
    });
  }

  userSearch(e) {
    let target = e.target;
    let value = target.value;
    if (value.length===1) {
      this.setState({
        searchTerm: value
      });
    }
    else {
      this.setState({
        searchTerm: value,
        loading: true
      });
    }
  }

  clearSearch() {
    if (this.state.searchTerm.length>0) {
      this.setState({
        searchTerm: "",
        loading: true
      });
    }
  }

  showUserRolesModal() {
    this.setState({
      userRolesModal: true
    });
  }

  hideUserRolesModal() {
    this.setState({
      userRolesModal: false
    });
  }

  componentDidMount() {
    this.loadItems();
    this.loadUserGroups();
    loadProgressBar();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.current_page!==this.state.current_page
    || prevState.paginate!==this.state.paginate
    || prevState.sort!==this.state.sort
    || this.state.loading
    ) {
      this.loadItems();
    }
  }

  render() {
    let redirectElement;
    if (this.state.redirect) {
      redirectElement = <Redirect to="/admin" />;
    }
    let contentTitle = 'List Users';
    let breadCrumbsArr = [{label:contentTitle,path:''}];
    let contentHTML = [];
    let sessionActive = sessionStorage.getItem('adminSessionActive');
    if (sessionActive!=='true') {
      contentHTML = <div className="item-container">
        <p className="text-center">This is a protected page. <br/>To view this page you must first login or register.</p>
      </div>;
    }
    else if (this.state.redirect) {
      contentHTML = <Redirect to="/"  />;
    }
    else {
      let content;
      let tableBody="";
      if (this.state.loading) {
        tableBody = <tr>
          <td colSpan="7">
            <div className="loader-container">
            </div>
          </td>
        </tr>;
      }
      else {
        tableBody = this.state.items;
      }
      let modalPreloader = <div className="loader-container"></div>;
      let modalContent = [];
      let savePreloader = [];
      let deletePreloader = [];
      if (this.state.form_saving) {
        savePreloader = <i className="fa fa-spin fa-circle-o-notch"></i>;
      }


      if (this.state.userModalLoading) {
        modalContent = modalPreloader;
      }

      //user groups
      let usergroup_default_checked0 = "";
      let usergroup_default_checked1 = "";
      if (parseInt(this.state.usergroup_default,10)===0) {
        usergroup_default_checked0 = "checked";
      }
      if (parseInt(this.state.usergroup_default,10)===1) {
        usergroup_default_checked1 = "checked";
      }
      let usergroupSavePreloader = [];
      let usergroupDeletePreloader = [];
      if (this.state.usergroupSaveStatus) {
        usergroupSavePreloader = <i className="fa fa-spin fa-circle-o-notch"></i>;
      }
      if (this.state.usergroupDeleteStatus) {
        usergroupDeletePreloader = <i className="fa fa-spin fa-circle-o-notch"></i>;
      }
      let userGroupErrorClass = "error-container";
      if (this.state.usergroupDeleteError) {
        userGroupErrorClass = "error-container-visible";
      }
      let userGroupform =
      <form onSubmit={this.handleUserGroupFormSubmit}>
        <button type="button" className="btn btn-letters btn-xs" onClick={this.hideEditUserGroup}><i className="fa fa-chevron-left"></i> Back</button>
        <div className={userGroupErrorClass}>{this.state.usergroupDeleteErrorText}</div>
        <div className="form-group">
          <label>Name</label>
          <input type="text" name="usergroup_name" className="form-control"  value={this.state.usergroup_name} onChange={this.handleFormChange.bind(this)} placeholder="Name..." />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea type="text" name="usergroup_description" value={this.state.usergroup_description} className="form-control" onChange={this.handleFormChange.bind(this)} placeholder="Description..."></textarea>
        </div>

        <div className="form-group">
          <label>Default</label><br/>
          <label style={{fontWeight: "normal"}}>
            <input name="usergroup_default" type="radio" value="0"
            checked={usergroup_default_checked0}
            onChange={this.handleFormChange.bind(this)}/> <small>No</small>
          </label>
          <label style={{fontWeight: "normal", marginLeft: "10px"}}>
            <input name="usergroup_default" type="radio" value="1"
            checked={usergroup_default_checked1}
            onChange={this.handleFormChange.bind(this)}/> <small>Yes</small>
          </label>
        </div>

        <hr />

        <button type="button" className="btn btn-danger" onClick={this.deleteUserGroup}><i className="fa fa-trash-o"></i> Delete  {usergroupDeletePreloader}</button>
        <button type="submit" className="btn btn-primary pull-right"><i className="fa fa-save"></i> Save {usergroupSavePreloader}</button>

      </form>;

      let userGroupsTable;
      if (this.state.userRolesModalLoading) {
        userGroupsTable = <tr><td colSpan="6" className="text-center">{modalPreloader}</td></tr>;;
      }
      else {
        userGroupsTable = this.state.modalUserRoles;
      }

      let editUserGroupFormClass = " hidden";
      let editUserGroupTableClass = "";
      if (this.state.showEditUserGroupForm) {
        editUserGroupFormClass = "";
        editUserGroupTableClass = " hidden";
      }
      let usergroupContent = [];
      if (this.state.usergroupLoading) {
        usergroupContent = <div className={editUserGroupFormClass} style={{marginTop: "-20px"}}>{modalPreloader}</div>;
      }
      else {
        usergroupContent = <div className={editUserGroupFormClass} style={{marginTop: "-20px"}}>{userGroupform}</div>;
      }

      if (this.state.deleting) {
        deletePreloader = <i className="fa fa-spin fa-circle-o-notch"></i>;
      }
      else {
        let status_checked0 = "";
        let status_checked1 = "";
        if (parseInt(this.state.user_status,10)===0) {
          status_checked0 = "checked";
        }
        if (parseInt(this.state.user_status,10)===1) {
          status_checked1 = "checked";
        }

        modalContent = <form onSubmit={this.handleFormSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="user_name" className="form-control" value={this.state.user_name} placeholder="Enter the fullname of the user"
            onChange={this.handleFormChange.bind(this)}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="user_email" className="form-control" value={this.state.user_email} placeholder="Enter the user email"
            onChange={this.handleFormChange.bind(this)} />
          </div>

          <div className="form-group">
            <label>Active</label><br/>
            <label style={{fontWeight: "normal"}}>
              <input name="user_status" type="radio" value="0"
              checked={status_checked0}
              onChange={this.handleFormChange.bind(this)}/> <small>No</small>
            </label>
            <label style={{fontWeight: "normal", marginLeft: "10px"}}>
              <input name="user_status" type="radio" value="1"
              checked={status_checked1}
              onChange={this.handleFormChange.bind(this)}/> <small>Yes</small>
            </label>
          </div>

          <div className="form-group">
            <label>User group</label>
            <select name="user_role" className="form-control" value={this.state.user_role} onChange={this.handleFormChange.bind(this)}>{this.state.usergroupOptions}</select>
          </div>

        </form>
      }
      content = <div className="table-responsive no-padding">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>ID</th>
              <th>Name</th>
              <th>E-mail</th>
              <th>Member since</th>
              <th>Active</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {tableBody}
          </tbody>
        </table>
      </div>;

      let activeDesc="",activeAsc="";
      if (this.state.sort==="desc") {
        activeDesc = "active";
      }
      if (this.state.sort==="asc") {
        activeAsc = "active";
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

      let paginationHTML = <div className="browse-filters">
        <DropdownButton
          title={this.state.userGroupsFilterText}
          id="groups-filter"
          >
          {this.state.userGroupsFilter}
        </DropdownButton>

        <DropdownButton
          title="Sort"
          id="sort-filter"
          >
          <MenuItem key="1" onClick={this.updateSort.bind(this,"desc")} className={activeDesc}><i className="fa fa-sort-amount-desc"></i> Desc</MenuItem>
          <MenuItem key="2" onClick={this.updateSort.bind(this,"asc")} className={activeAsc}><i className="fa fa-sort-amount-asc"></i> Asc</MenuItem>
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

      contentHTML = <div>
        <div className="row">
          <div className="col-xs-12">
            {paginationHTML}
            <div className="item-container">
              <div className="row" style={{marginBottom: "15px"}}>
                <div className="col-xs-8 col-sm-4">
                  <input name="search_user" type="text" className="form-control" placeholder="Search..." onChange={this.userSearch.bind(this)} value={this.state.searchTerm}
                  />
                  <div className="clear-search-user" onClick={this.clearSearch}>
                    <i className="fa-times-circle fa"></i>
                  </div>
                </div>
                <div className="col-xs-4 col-sm-2">
                  <DropdownButton
                    bsStyle="default"
                    title={this.state.searchTypeTitle}
                    key="search-user-dropdown"
                    id="dropdown-basic-search-user-dropdown"
                  >
                    <MenuItem eventKey="1" onClick={this.updateUserSearchType.bind(this,"Name")}>Name</MenuItem>
                    <MenuItem eventKey="2" onClick={this.updateUserSearchType.bind(this,"Email")}>Email</MenuItem>
                  </DropdownButton>
                </div>
                <div className="col-xs-12 col-sm-6">
                  <div className="text-right">
                    <button type="button" className="btn btn-letters btn-sm" onClick={this.showUserRolesModal}>User groups <i className="fa fa-pencil"></i></button>
                  </div>
                </div>
              </div>
              {content}
            </div>
            {paginationHTML}
          </div>
        </div>

        <ConfirmModal
          headerText="Delete User"
          bodyText={"The User \""+this.state.user_name+"\" will be deleted. This action cannot be undone. Continue?"}
          buttonCancel={<button type="button" className="pull-left btn btn-primary btn-sm" onClick={this.hideDeleteUserConfirmModal}>Cancel</button>}
          buttonSuccess={<button type="button" className="btn btn-danger btn-sm" onClick={this.deleteUser}><i className="fa fa-trash-o"></i> Delete {deletePreloader}</button>}
          showModal={this.state.showdeleteUserConfirm}
        />

        <Modal
          show={this.state.showUserModal}
          onHide={this.hideUserModal}
          >
            <Modal.Header closeButton>
              <Modal.Title>{this.state.userModalHeaderText}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {modalContent}

            </Modal.Body>
            <Modal.Footer>
              <button type="button" className="btn btn-danger pull-left"  onClick={this.showDeleteUserConfirmModal}>
                <i className="fa fa-trash-o"></i> Delete</button>
              <button type="button" className="btn btn-primary" onClick={this.handleFormSubmit}>
                <i className="fa fa-save"></i> Save {savePreloader}</button>
            </Modal.Footer>
        </Modal>


        <Modal
          show={this.state.userRolesModal}
          onHide={this.hideUserRolesModal}
          >
            <Modal.Header closeButton>
              <Modal.Title>User groups</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="text-right">
                <button type="button" className="btn btn-letters btn-xs" onClick={this.showEditUserGroup.bind(this,0)}>Add new <i className="fa fa-plus"></i></button>
              </div>
              {usergroupContent}
              <div className={"table-responsive no-padding"+editUserGroupTableClass}>
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th style={{width: "40px"}}>#</th>
                      <th style={{width: "40px"}}>ID</th>
                      <th>User group</th>
                      <th style={{width: "40px"}}>Is Admin</th>
                      <th style={{width: "40px"}}>Is Default</th>
                      <th style={{width: "40px"}}>Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userGroupsTable}
                  </tbody>
                </table>
              </div>

            </Modal.Body>
        </Modal>

      </div>;



    }

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
      </div>
    );
  }
}
