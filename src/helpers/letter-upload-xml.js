import React, {Component} from 'react';
import Dropzone from 'react-dropzone';
import {APIPath} from '../common/constants.js';
import axios from 'axios';
import {loadProgressBar} from 'axios-progress-bar';

export default class LetterUploadXML extends Component {
  constructor() {
    super()
    this.state = {
      files: [],
      dissaproved_files: [],
      post_status:false,
      updateBtnText: <span><i className="fa fa-upload"></i> Upload</span>,
      progress_visible: false,
      progress_bar_width: 0,
      error: false,
      errorTxt: "",
    }
    this.onDrop = this.onDrop.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);
  }

  onDrop(files) {
    let approvedFiles = [];
    let disapprovedFiles = [];
    for (let i=0; i<files.length;i++) {
      let file = files[i];
      if (file.type === "text/xml") {
        approvedFiles.push(file);
      }
      else {
        disapprovedFiles.push(file);
      }
    }
    this.setState({
      files: approvedFiles,
      dissaproved_files: disapprovedFiles
    });

  }

  uploadFiles() {
    if (this.state.files.length===0) {
      return false;
    }
    let postStatus = this.state.post_status;
    if (postStatus) {
      return false;
    }
    let files = this.state.files;
    if (this.state.files.length===0) {
      this.setState({
        error: true,
        errorTxt: "Please select a file to upload"
      })
      return false;
    }
    this.setState({
      post_status:true,
      error: false,
      updateBtnText: <span><i className="fa fa-upload"></i> Uploading... <i className="fa fa-circle-o-notch fa-spin"></i></span>,
      progress_visible: true
    });

    let context = this;
    let path = APIPath+"fileupload";
    let postData = new FormData();
    files.forEach(function(file) {
      postData.append("data[]",file);
    });
    postData.append("format", "xml_tei_letter19xx");
    let accessToken = sessionStorage.getItem('adminAccessToken');
    axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
    context.setState({
      upload_loader:true
    });
    axios({
      method: "post",
      url: path,
      data: postData,
      crossDomain: true,
      config: { headers: {'Content-Type': 'multipart/form-data'}},
      onUploadProgress: function (progressEvent){
        let percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
        let progressBarWidth = percentCompleted;
        context.setState({
          progress_bar_width: progressBarWidth
        });
      }
    })
    .then(function (response) {
        let responseData = response.data;
        if (responseData.status===200) {
          context.props.handleLoadItem(true);
          context.setState({
            files: [],
            dissaproved_files: [],
            post_status:false,
            updateBtnText: <span><i className="fa fa-upload"></i> Uploaded successfully <i className="fa fa-check"></i></span>
          });
          setTimeout(function() {
            context.setState({
              progress_visible: false,
              progress_bar_width:0,
              updateBtnText: <span><i className="fa fa-upload"></i> Upload</span>,
            });
          },1000);
        }
    })
    .catch(function (response) {
        //handle error
        context.setState({post_status:false});
        console.log(response);
    });
  }

  componentDidMount() {
    loadProgressBar();
  }

  render() {
    let filesList = "";
    let dissaprovedFilesList = "";
    let errorVisible = "";
    let uploadBtn = <button className="btn btn-success" onClick={this.uploadFiles} disabled>{this.state.updateBtnText}</button>;;
    if (this.state.error) {
      errorVisible = " visible";
    }
    let progressVisible = " hidden";
    if (this.state.progress_visible) {
      progressVisible = "";
    }
    if (this.state.files.length>0) {
      filesList = <div>
        <b>Selected file</b>
        <ul>
          {
            this.state.files.map(f => <span key={f.name}>{f.name} - {f.size} bytes</span>)
          }
        </ul>
      </div>;
      uploadBtn = <button className="btn btn-success" onClick={this.uploadFiles}>{this.state.updateBtnText}</button>;
    }
    if (this.state.dissaproved_files.length>0) {
      dissaprovedFilesList = <div>
        The file <b className="dissaproved">{this.state.dissaproved_files.map(f => <span key={f.name} className="dissaproved-file">{f.name}</span>)}</b> is not allowed!
      </div>
    }

    let progressBar = "";
    if (this.state.upload_loader===true) {
      progressBar = <div style={{padding: "15px 0"}}>
        <div className={"progress progress-sm active"+progressVisible}>
          <div className="progress-bar progress-bar-success progress-bar-striped" role="progressbar" aria-valuenow={this.state.progress_bar_width} aria-valuemin="0" aria-valuemax="100" style={{width : this.state.progress_bar_width+"%"}}>
            <span className="sr-only">{this.state.progress_bar_width}% Complete</span>
          </div>
        </div>
      </div>;
    }
    let dropZoneStyle = {
      width: "100%",
      height: "auto"
    }
    return (
      <div>
        <div className={"error-container"+errorVisible}>{this.state.errorTxt}</div>
        <b>Upload new XML file</b>
        <div>
          <div className="dropzone">
            <Dropzone
              multiple={false}
              onDrop={this.onDrop.bind(this)}
              style={dropZoneStyle}
              >
              <p>To upload a new XML file drag and drop the file into the box<br/> - or - <br/>click in the box to browse your computer for the file.</p>
              {filesList}
              {dissaprovedFilesList}
            </Dropzone>
          </div>

          <div className="text-center" style={{padding: "15px 0"}}>
            {uploadBtn}
            {progressBar}
          </div>
        </div>
      </div>
    );
  }
}
