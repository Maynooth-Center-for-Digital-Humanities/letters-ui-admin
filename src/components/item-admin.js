import React, {Component} from 'react';
import axios from 'axios';
import {Redirect, Link} from 'react-router-dom';

import {APIPath} from '../common/constants';
import {loadProgressBar} from 'axios-progress-bar';
import {Modal} from 'react-bootstrap';

import LetterUploadXML from '../helpers/letter-upload-xml.js';

export default class ItemAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deleteStatus:false,
      showDeleteConfirm: false,
      redirect:false,
      updateTranscriptionStatusBtn:[],
      updateTranscriptionSubmit: false,
      generateXMLSubmit:false,
      generateXMLbtnText:'Generate XML',
      generateXMLerrors:'',
      generateXMLURL:'',
    }
    this.showDeleteConfirm = this.showDeleteConfirm.bind(this);
    this.hideDeleteConfirm = this.hideDeleteConfirm.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.setTranscriptionStatus = this.setTranscriptionStatus.bind(this);
    this.generateXML = this.generateXML.bind(this);
  }

  showDeleteConfirm(archive_filename) {
    this.setState({
      showDeleteConfirm: true,
    });
  }

  hideDeleteConfirm() {
    this.setState({
      showDeleteConfirm: false
    });
  }

  deleteItem() {
    let itemId = this.props.id;
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
          redirect:true,
        });
      }
      else {
        alert(response.data.errors);
      }

    })
    .catch(function (error) {
      console.log(error);
    });
  }

  setTranscriptionStatus(value) {
    this.setState({
      updateTranscriptionSubmit:true,
      updateTranscriptionStatusBtn: <i className="fa fa-circle-o-notch fa-spin"></i>,
    })
    let itemId = this.props.id;
    let context = this;
    let path = APIPath+"update-letter-transcription-status/"+itemId;
    let accessToken = sessionStorage.getItem('adminAccessToken');
    let arrayData = {
      "status": value,
    }
    axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
    axios({
      method: 'POST',
      url: path,
      data: arrayData,
      crossDomain: true,
    })
    .then(function (response) {
      context.setState({
        updateTranscriptionSubmit: false,
        updateTranscriptionStatusBtn: <i className="fa fa-check"></i>,
      });
      context.props.handleLoadItem(true);
      setTimeout(function() {
        context.setState({
          updateTranscriptionStatusBtn: []
        });
      },1500);
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  generateXML() {
    if (this.state.generateXMLSubmit) {
      return false;
    }
    this.setState({
      generateXMLSubmit: true,
      generateXMLbtnText: <span>Working... <i className="fa fa-spin fa-circle-o-notch"></i></span>
    });
    let itemId = this.props.id;
    let context = this;
    let path = APIPath+"generate-xml/"+itemId;
    let accessToken = sessionStorage.getItem('adminAccessToken');
    axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
    axios({
      method: 'get',
      url: path,
      crossDomain: true,
    })
    .then(function (response) {
      let responseData = response.data;
      if (responseData.status) {
        let errorText = "";
        if (responseData.errors!=="") {
          errorText = responseData.errors
        }
        context.setState({
          generateXMLSubmit: false,
          generateXMLbtnText:'Generate XML',
          generateXMLerrors: errorText,
          generateXMLURL: <a href={responseData.data.url} download>{responseData.data.filename}</a>,
        })
      }
      else {
        context.setState({
          generateXMLSubmit: false,
          generateXMLbtnText:'Generate XML',
          generateXMLerrors: '',
          generateXMLURL: '',
        })
      }

    })
    .catch(function (error) {
      context.setState({
        generateXMLSubmit: false,
        generateXMLbtnText:'Generate XML',
        generateXMLerrors: '',
        generateXMLURL: ''
      })
    });
  }

  componentDidMount() {
    loadProgressBar();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.redirect===false && this.state.redirect===true) {
      this.setState({
        redirect: false
      });
    }
  }

  render() {
    let redirectElement;
    if (this.state.redirect===true) {
      redirectElement = <Redirect to={{
        pathname: '/',
      }}
      />
    }
    let content;
    let errorVisible;
    if (this.state.error) {
      errorVisible = " visible";
    }

    let statusTxt = "Not published";
    if (this.props.item.entry.status===1) {
      statusTxt = "Published";
    }
    let transcriptionStatusTxt = <span className="label label-default">Not available for transcription</span>;
    if (this.props.item.entry.transcription_status===0) {
      transcriptionStatusTxt = <span className="label label-success">Open for transcription</span>;
    }
    if (this.props.item.entry.transcription_status===1) {
      transcriptionStatusTxt = <span className="label label-warning">Transcription completed</span>;
    }
    if (this.props.item.entry.transcription_status===2) {
      transcriptionStatusTxt = <span className="label label-danger">Transcription approved</span>;
    }


    let downloadFile = [];
    if (typeof this.props.item.file!=="undefined") {
      if (this.props.item.file.id>0) {
        downloadFile = <div>
          <label>XML File: </label> <a download href={this.props.item.file.link}>{this.props.item.file.original_filename}</a>
        </div>;
      }
    }
    let file = <div className="admin-file-container">
      <div className="form-group">
        {downloadFile}
      </div>
      <LetterUploadXML handleLoadItem={this.props.handleLoadItem} />
    </div>;


    let currentVersion = "No";
    if (parseInt(this.props.item.entry.current_version,10)===1) {
      currentVersion = "Yes";
    }


    let otherVersions = "None";
    if (this.props.item.siblings.length>0) {
      otherVersions = this.props.item.siblings.map(sibling => {
          if (sibling.current_version===1) {
            return <div key={sibling.id}>
              <span className="item-sibling-link">{sibling.id+" (current version)"}</span>
              <a className="btn btn-default btn-xs item-sibling-link" href={"/item/"+sibling.id} target="_blank">
                <i className="fa fa-eye"></i>
              </a>
              <Link to={"/admin/item/"+sibling.id} href={"/admin/item/"+sibling.id} className="btn btn-letters btn-xs item-sibling-link">
                <i className="fa fa-pencil"></i>
              </Link>
            </div>
          }
          else {
            return <div key={sibling.id}>
              <span className="item-sibling-link">{sibling.id}</span>
              <a className="btn btn-default btn-xs item-sibling-link" href={"/item/"+sibling.id} target="_blank">
                <i className="fa fa-eye"></i>
              </a>
              <Link to={"/admin/item/"+sibling.id} href={"/admin/item/"+sibling.id} className="btn btn-letters btn-xs item-sibling-link">
                <i className="fa fa-pencil"></i>
              </Link>
            </div>
          }
        }
      );

    }

    let transcriptionOpenActive = "";
    let transcriptionNotAvailableActive = "";

    if (parseInt(this.props.item.entry.transcription_status, 10)>-1) {
      transcriptionOpenActive = " active";
    }
    if (parseInt(this.props.item.entry.transcription_status, 10)===-1) {
      transcriptionNotAvailableActive = " active";
    }
    content = <div>
      <div className="row">
        <div className="col-xs-12">
          <div className={"error-container"+errorVisible}>{this.state.errorTxt}</div>
          <h4>{this.props.item.title}</h4>
        </div>
      </div>
      <div className="row">
        <div className="col-xs-12 col-sm-12 col-md-6">

          <div className="form-group">
            <label>Status: </label> {statusTxt}
          </div>

          <div className="form-group">
            <label>Transcription status: </label> {transcriptionStatusTxt}
          </div>

          <div className="form-group">
            <label>Document id: </label> {this.props.item.document_id}
          </div>

          <div className="form-group">
            <label>Current version: </label> {currentVersion}
          </div>

          <div className="form-group">
            <label>Number of pages: </label> {this.props.item.pages.length}
          </div>

          <div className="form-group">
            <label>Created at: </label> {this.props.item.entry.created_at}
          </div>

          <div className="form-group">
            <label>Last updated at: </label> {this.props.item.entry.updated_at}
          </div>

          <div className="form-group">
            <label>Uploader: </label> {this.props.item.uploader.name} ({this.props.item.uploader.email})
          </div>

          <div className="form-group">
            <label>Other versions: </label>
            <div>{otherVersions}</div>
          </div>
        </div>
          <div className="col-xs-12 col-sm-12 col-md-6">
            <div className="form-group">
              <label>Update Transcription status</label>
              <div style={{padding: "15px 0"}}>
                <div className="btn-group">
                  <button type="button" className={"btn btn-sm btn-success"+transcriptionOpenActive} onClick={this.setTranscriptionStatus.bind(this, "active")}>Active</button>
                  <button type="button" className={"btn btn-sm btn-grey"+transcriptionNotAvailableActive} onClick={this.setTranscriptionStatus.bind(this, "inactive")}>Not available</button>
                </div>
                <div style={{marginLeft: "15px", display: "inline-block"}}>{this.state.updateTranscriptionStatusBtn}</div>
              </div>
            </div>
            <div className="form-group">
              <label>Generate XML</label><br/>
              <button type="button" className="btn btn-letters btn-sm" onClick={this.generateXML}>{this.state.generateXMLbtnText}</button>
              <span style={{paddingLeft: "15px"}}>{this.state.generateXMLURL}</span>
            </div>
            {file}
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">

            <div className="item-admin-delete text-left">
              <a className="btn btn-default" href={"/item/"+this.props.item.entry.id} target="_blank">
                <i className="fa fa-eye"></i> Preview
              </a>
              <button className="btn btn-danger pull-right" type="button" onClick={this.showDeleteConfirm}><i className="fa fa-trash-o"></i> Delete</button>
            </div>
          </div>
        </div>
      </div>;


    return(
      <div className="row">
        <div className="col-xs-12" style={{padding: "15px"}}>
          {content}

          <Modal
            show={this.state.showDeleteConfirm}
            onHide={this.hideDeleteConfirm}
            bsSize="small"
            >
              <Modal.Header closeButton>
                <Modal.Title>"Delete Item"</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {"The item \""+this.props.item.title+"\" will be deleted. This action cannot be undone. Continue?"}
              </Modal.Body>
              <Modal.Footer>
                <button type="button" className="pull-left btn btn-primary btn-sm" onClick={this.hideDeleteConfirm}>Cancel</button>
                <button className="btn btn-danger pull-right btn-sm" type="button" onClick={this.deleteItem}><i className="fa fa-trash-o"></i> Delete</button>
              </Modal.Footer>
          </Modal>

          {redirectElement}

        </div>
      </div>
    );
  }
}
