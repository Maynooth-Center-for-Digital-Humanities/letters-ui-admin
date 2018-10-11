import React from 'react';
import {Modal} from 'react-bootstrap';
import axios from 'axios';
import {loadProgressBar} from 'axios-progress-bar';
import {APIPath} from '../common/constants.js';

export default class ItemAddPage extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      showModal: false,
      image: [],
      additional_img_info: "Letter",
      submitStatus: false,
      updateBtnText: <span><i className="fa fa-upload"></i> Upload</span>,
      progress_visible: false,
      progress_bar_width: 0,
      error: false,
      errorTxt: "",
    }
    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  handleClose() {
    this.setState({ showModal: false });
  }

  handleShow() {
    this.setState({ showModal: true });
  }

  handleFileChange(e) {
    let target = e.target;
    let value = target.files[0];
    let name = target.name;

    this.setState({
      [name]:value
    });
  }

  handleFormChange(e) {
    let target = e.target;
    let value = target.value;
    let name = target.name;

    this.setState({
      [name]:value
    });
  }

  handleFormSubmit(e) {
    e.preventDefault();
    let submitStatus= this.state.submitStatus;
    if (submitStatus) {
      return false;
    }
    if (this.state.image.length===0) {
      this.setState({
        error: true,
        errorTxt: "Please select a file to upload"
      })
      return false;
    }
    this.setState({
      error: false,
      submitStatus: true,
      updateBtnText: <span><i className="fa fa-upload"></i> Uploading... <i className="fa fa-circle-o-notch fa-spin"></i></span>,
      progress_visible: true
    });
    let itemId = this.props.id;
    let context = this;
    let formData = new FormData();
    
    formData.append("image",this.state.image);
    formData.append("additional_img_info",this.state.additional_img_info);
    let accessToken = sessionStorage.getItem('adminAccessToken');
    axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
    axios({
      method: 'POST',
      url: APIPath+'admin/upload-entry-page/'+itemId,
      data: formData,
      crossDomain: true,
      config: { headers: {'Content-Type': 'multipart/form-data' }},
      onUploadProgress: function (progressEvent){
        let percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
        let progressBarWidth = percentCompleted;
        context.setState({
          progress_bar_width: progressBarWidth
        });
      }
    })
    .then(function (response) {
        if (response.data.status===true) {
          context.props.handleLoadItem(true);
          context.setState({
            updateBtnText: <span><i className="fa fa-upload"></i> Uploaded successfully <i className="fa fa-check"></i></span>
          });
          setTimeout(function() {
            context.setState({
              progress_visible: false,
              progress_bar_width:0,
              updateBtnText: <span><i className="fa fa-upload"></i> Upload</span>,
              submitStatus: false,
            });
          },1000);
        }
        else if (response.data.status===false) {
          let errorsOutput = [];
          for (let error in response.data.errors) {
            errorsOutput.push(<div>{response.data.errors[error]}</div>);
          }
          context.setState({
            updateBtnText: <span>Error saving... <i className="fa fa-times"></i></span>,
            submitStatus: false,
            error: true,
            errorTxt: errorsOutput,
          });
          setTimeout(function() {
            context.setState({
              updateBtnText: <span><i className="fa fa-upload"></i> Upload</span>,
            });
          },1000);
        }
  	  })
  	  .catch(function (error) {
  	    console.log(error);
  	  });
  }

  componentDidMount() {
    loadProgressBar();
  }

  render() {
    let errorVisible = "";
    if (this.state.error) {
      errorVisible = " visible";
    }
    let progressVisible = " hidden";
    if (this.state.progress_visible) {
      progressVisible = "";
    }
    const newModal = (
      <Modal
        show={this.state.showModal}
        onHide={this.handleClose}
        bsSize="small"
        >
          <Modal.Header closeButton>
            <Modal.Title>Upload new File</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className={"error-container"+errorVisible}>{this.state.errorTxt}</div>
            <form encType="multipart/form-data">
              <div className="form-group">
                <label>Image file</label>
                <input name="image" accept="image/*" type="file"
                onClick={(event)=> {event.target.value = null }} onChange={this.handleFileChange.bind(this)}
                />
              </div>
              <div className="form-group">
                <label>Image type</label>
                <div className="row">
                  <div className="col-xs-12 col-sm-6">
                    <select className="form-control" name="additional_img_info"     onChange={this.handleFormChange.bind(this)}>
                      <option value="Letter">Letter</option>
                      <option value="Envelope">Envelope</option>
                      <option value="Enclosure">Enclosure</option>
                      <option value="Photograph">Photograph</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>

            <div className={"progress progress-sm active"+progressVisible}>
              <div className="progress-bar progress-bar-success progress-bar-striped" role="progressbar" aria-valuenow={this.state.progress_bar_width} aria-valuemin="0" aria-valuemax="100" style={{width : this.state.progress_bar_width+"%"}}>
                <span className="sr-only">{this.state.progress_bar_width}% Complete</span>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-letters pull-right" onClick={this.handleFormSubmit}>{this.state.updateBtnText}</button>
          </Modal.Footer>
      </Modal>
    );
    return(
      <div className="text-right" style={{paddingTop: "10px"}}>
        <button className="btn btn-letters btn-sm" onClick={this.handleShow}>Add new page <i className="fa fa-plus"></i></button>
        {newModal}

      </div>
    );
  }
}
