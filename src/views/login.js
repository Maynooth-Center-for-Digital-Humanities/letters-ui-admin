import React, { Component } from 'react';
import axios from 'axios';
import {APIPath} from '../common/constants';
import logo from '../assets/images/logo-update.png';
import {sessionCookie} from '../helpers/helpers';

export class LoginView extends Component {
  constructor(props) {
    super(props);

    this.state = {
			email: '',
			password: '',
      isAdmin: false,
			login_error: '',
			login_error_class: 'error-container',
		};

    this.handleFormChange = this.handleFormChange.bind(this);
		this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  // login form
	handleFormChange(e) {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleFormSubmit(e) {
		e.preventDefault();
		var context = this;
		axios.post(APIPath+'login', {
			email: this.state.email,
			password: this.state.password
		})
	  .then(function (response) {
	    let status = response.data.status;
	    if (typeof status!== undefined && status===true) {
        let isAdmin = false;
        let roles = response.data.data.roles;
        for (let i=0;i<roles.length; i++) {
          let role = roles[i];
          if (role.is_admin===1) {
            isAdmin = true;
          }
        }
        sessionStorage.clear();
        context.setState({
					isAdmin:isAdmin,
					login_error:'',
					login_error_class:'error-container'
				});
        context.props.setAdmin(isAdmin);
        sessionStorage.setItem('adminUserName', response.data.data.userName);
	      sessionStorage.setItem('adminSessionActive', true);
	      sessionStorage.setItem('adminAccessToken', response.data.data.accessToken);
				sessionCookie(response.data.data.userName, true, response.data.data.accessToken, false);
	    }
	    else {
	      let error = response.data.errors;
				let errorText = "";
	      for (var e in error) {
					errorText = error[e];
	      }
	      context.setState({
					login_error:errorText,
					login_error_class:'error-container-visible'
				});
	    }
	  })
	  .catch(function (error) {
	    console.log(error);
	  });
  }

  render() {
    return(
      <div className="login-box">
        <div className="login-logo">
          <img src={logo} alt="Letters 1916-1923" />
        </div>
        <div className="login-box-body">
          <form name="login-form" onSubmit={this.handleFormSubmit}>
            <div className={this.state.login_error_class}></div>
            <div className="form-group has-feedback">
              <input name="email" type="email" className="form-control" placeholder="Email" value={this.state.email} onChange={this.handleFormChange} />
              <span className="glyphicon glyphicon-envelope form-control-feedback"></span>
            </div>
            <div className="form-group has-feedback">
              <input name="password" type="password" className="form-control" placeholder="Password" value={this.state.password} onChange={this.handleFormChange} />
              <span className="glyphicon glyphicon-lock form-control-feedback"></span>
            </div>
		        <div className="text-center">
		         	<button type="submit" className="btn btn-letters btn-block btn-flat">Sign In</button>
		        </div>
          </form>
        </div>
      </div>
    )
  }
}
