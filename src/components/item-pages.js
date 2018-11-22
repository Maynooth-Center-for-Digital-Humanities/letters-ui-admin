import React from 'react';
import axios from 'axios';
import {APIPath,archivePath} from '../common/constants';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TranscriptionImageViewer from '../components/transcribe/image-viewer';
import TranscriptionEditor from '../components/transcribe/editor-ck';
import ItemAddPage from '../components/item-add-page';
import {Modal} from 'react-bootstrap';
import {fixImagePath} from '../helpers/helpers';

export default class ItemPages extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pages: [],
      page: [],
      selectedPage: 0,
      loadItem: false,
      showDeleteConfirm: false,
      updateTranscriptionSubmit: false,
      editor: "wysiwyg",
      transcriptionUpdateBtn: []
    };
    this.showPage = this.showPage.bind(this);
    this.updateTranscriptionStatus = this.updateTranscriptionStatus.bind(this);
    this.openPageForTrancription = this.openPageForTrancription.bind(this);
    this.updatePages = this.updatePages.bind(this);
    this.updateErrorState = this.updateErrorState.bind(this);
    this.disableNav = this.disableNav.bind(this);
    this.enableNav = this.enableNav.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.reorderPages = this.reorderPages.bind(this);
    this.showDeleteConfirm = this.showDeleteConfirm.bind(this);
    this.hideDeleteConfirm = this.hideDeleteConfirm.bind(this);
    this.removeFormImage = this.removeFormImage.bind(this);
    this.toggleEditor = this.toggleEditor.bind(this);
  }

  updateTranscriptionStatus(e) {
    let newTranscriptionStatus = e.target.value;
    let updateTranscriptionSubmit = this.state.updateTranscriptionSubmit;
    if (updateTranscriptionSubmit) {
      return;
    }
    this.setState({
      updateTranscriptionSubmit:true,
      transcriptionUpdateBtn: <i className="fa fa-circle-o-notch fa-spin"></i>,
    });
    let context = this;
    let accessToken = sessionStorage.getItem('adminAccessToken');
    axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
		axios.post(APIPath+'update-letter-transcription-page-status/'+this.props.id, {
      'archive_filename': this.state.page.archive_filename,
      'transcription_status': newTranscriptionStatus
    })
	  .then(function (response) {
      if (response.data.status===true) {
        let newPage = Object.assign({}, context.state.page);
        for (let i=0;i<response.data.data.length; i++) {
          let page = response.data.data[i];
          if (page.archive_filename===context.state.page.archive_filename) {
            newPage = page;
          }
        }
        newPage['transcription_status'] = newTranscriptionStatus;
        context.setState({
          updateTranscriptionSubmit: false,
          page: newPage,
          transcriptionUpdateBtn: <i className="fa fa-check"></i>,
        });
        context.props.handleLoadItem(true);
        setTimeout(function() {
          context.setState({
            transcriptionUpdateBtn: []
          });
        },1500);
      }
	  })
	  .catch(function (error) {
	    console.log(error);
	  });
  }

  openPageForTrancription() {
    let newTranscriptionStatus = 0;
    let updateTranscriptionSubmit = this.state.updateTranscriptionSubmit;
    if (updateTranscriptionSubmit) {
      return;
    }
    this.setState({
      updateTranscriptionSubmit:true,
      transcriptionUpdateBtn: <i className="fa fa-circle-o-notch fa-spin"></i>,
    });
    let context = this;
    let accessToken = sessionStorage.getItem('adminAccessToken');
    axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
		axios.post(APIPath+'update-letter-transcription-page-status/'+this.props.id, {
      'archive_filename': this.state.page.archive_filename,
      'transcription_status': newTranscriptionStatus
    })
	  .then(function (response) {
      if (response.data.status===true) {
        let newPage = Object.assign({}, context.state.page);
        newPage['transcription_status'] = newTranscriptionStatus;
        context.setState({
          updateTranscriptionSubmit: false,
          page: newPage,
          transcriptionUpdateBtn: <i className="fa fa-check"></i>,
        });
        context.props.handleLoadItem(true);
        setTimeout(function() {
          context.setState({
            transcriptionUpdateBtn: []
          });
        },1500);
      }
	  })
	  .catch(function (error) {
	    console.log(error);
	  });
  }

  showPage(i, key) {
    if (!this.state.navDisabled) {
      let newPage = this.state.pages[i];
      let newPageStatus = 0;
      newPageStatus = parseInt(newPage.transcription_status,10);
      this.setState({
        page: newPage,
        selectedPage: key,
        transcription_status: newPageStatus
      });
    }
  }

  updatePages(pages) {
    this.setState({
      pages: pages
    });
    this.props.updateStatePages(pages);
  }

  updateErrorState(newError) {
    this.setState({
      error: newError.error,
      msg: newError.msg
    });
  }

  disableNav(navDisabled) {
    if (!this.state.navDisabled) {
      this.setState({
        navDisabled: true
      });
    }
  }

  enableNav() {
    if (this.state.navDisabled) {
      this.setState({
        navDisabled: false
      });
    }
  }

  onDragEnd(result) {
    if (!result.destination) {
      return false;
    }

    const pages = this.reorderPages(
      this.state.pages,
      result.source.index,
      result.destination.index
    );

    let itemId = this.props.id;
    let path = APIPath+"update-letter-pages-order/"+itemId;
    let accessToken = sessionStorage.getItem('adminAccessToken');
    axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
    axios({
      method: 'POST',
      url: path,
      data: {"pages":pages},
      crossDomain: true,
    })
    .then(function (response) {
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  reorderPages(list, startIndex, endIndex){
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    this.props.updateStatePages(result);
    return result;
  }

  showDeleteConfirm(archive_filename) {
    this.setState({
      showDeleteConfirm: true,
      deleteConfirmSubmit: this.removeFormImage.bind(this, archive_filename)
    });
  }

  hideDeleteConfirm() {
    this.setState({
      showDeleteConfirm: false
    });
  }

  removeFormImage(archive_filename) {
    let itemId = this.props.id;
    let context = this;
    let path = APIPath+"delete-letter-page";
    let accessToken = sessionStorage.getItem('adminAccessToken');
    let arrayData = {
      "id":itemId,
      "archive_filename":archive_filename
    }
    axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
    axios({
      method: 'DELETE',
      url: path,
      data: arrayData,
      crossDomain: true,
    })
    .then(function (response) {
      context.props.handleLoadItem(true);
      context.hideDeleteConfirm();
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  toggleEditor(value) {
    this.setState({
      editor: value
    });
  }

  componentDidMount() {
    if (this.props.pages.length>0) {
      this.setState({
        selectedPage: this.props.pages[0].archive_filename,
        page: this.props.pages[0],
        pages: this.props.pages
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.pages!==this.state.pages) {
      this.setState({
        pages: this.props.pages
      })
    }
  }

  render() {
    let newThumbnails = [];
    let content;
    if (!this.state.loading) {
      if (this.state.pages.length>0) {

        let wysiwygActive = "";
        let xmlActive = "";
        if (this.state.editor==="wysiwyg") {
          wysiwygActive = " active";
        }
        if (this.state.editor==="xml") {
          xmlActive = " active";
        }

        const grid = 8;
        const getItemStyle = (isDragging, draggableStyle) => ({
          userSelect: 'none',
          padding: grid * 2,
          margin: `0 ${grid}px 0 0`,
          background: '#ffffff',
          position: 'relative',
          ...draggableStyle,
        });
        newThumbnails = this.state.pages.map((page, i) =>

          <Draggable key={page.archive_filename} draggableId={"draggable-"+page.archive_filename} index={i}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={getItemStyle(
                  snapshot.isDragging,
                  provided.draggableProps.style
                )}
              >
                <Thumbnail key={page.archive_filename} page={page} i={i} selectedPage={this.state.selectedPage} function={this.showPage} showDeleteConfirm={this.showDeleteConfirm}/>
              </div>
            )}
          </Draggable>
        );

        let getListStyle = isDraggingOver => ({
          background: isDraggingOver ? '#f5f5f5' : '#ffffff',
          display: 'flex',
          padding: grid,
          overflow: 'auto',
        });

        let transcriptionStatusEdit = <select className="form-control" name="transcription-status" value={this.state.page.transcription_status} onChange={this.updateTranscriptionStatus}>
          <option value={0}>Open for transcription</option>
          <option value={1}>Transcription completed</option>
          <option value={2}>Transcription approved</option>
        </select>;

        if (parseInt(this.state.page.transcription_status,10)===-1) {
          transcriptionStatusEdit = <button type="button" className="btn btn-success btn-sm" onClick={this.openPageForTrancription}>Open page for transcription</button>
        }

        content = <div>
          <div className="pages-thumbnails">
          <DragDropContext
            onDragEnd={this.onDragEnd}
            >
            <Droppable droppableId="droppable-1" direction="horizontal">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                  {...provided.droppableProps}
                >
                  {newThumbnails}
                </div>
              )}
            </Droppable>

            </DragDropContext>
          </div>

          <div className="row" style={{borderTop: "1px solid #ededed"}}>
            <div className="col-xs-12 col-sm-6">
              <div className="text-left" style={{paddingTop: "15px"}}>
                <div className="form-group">
                  <div style={{display: "inline-block", paddingRight: "15px"}}>
                    <label>Transcription status: </label>
                  </div>
                  <div style={{display: "inline-block", width: "200px"}}>
                    {transcriptionStatusEdit}
                  </div>
                  <div className="transcription-status-update-icon">
                    {this.state.transcriptionUpdateBtn}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xs-12 col-sm-6">
              <div className="text-right" style={{paddingTop: "15px"}}>
                <label>Active editor: </label>
                <div className="btn-group" data-toggle="btn-toggle" style={{marginLeft: "15px"}}>
                  <button type="button" className={"btn btn-default btn-sm"+wysiwygActive} onClick={this.toggleEditor.bind(this, "wysiwyg")}>WYSIWYG</button>
                  <button type="button" className={"btn btn-default btn-sm"+xmlActive} onClick={this.toggleEditor.bind(this, "xml")}>XML</button>
                </div>
              </div>
            </div>
          </div>

          <TranscriptionImageViewer
                page={this.state.page} />

          <TranscriptionEditor
            updatePages={this.updatePages}
            letterId={this.props.id}
            page={this.state.page}
            id="letter-edit"
            error={this.updateErrorState}
            disableNav={this.disableNav}
            enableNav={this.enableNav}
            editorType={this.state.editor}
            />

          <Modal
            show={this.state.showDeleteConfirm}
            onHide={this.hideDeleteConfirm}
            bsSize="small"
            >
              <Modal.Header closeButton>
                <Modal.Title>"Delete page"</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p>The page will be deleted. Continue?</p>
              </Modal.Body>
              <Modal.Footer>
                <button type="button" className="pull-left btn btn-primary btn-sm" onClick={this.hideDeleteConfirm}>Cancel</button>
                <button type="button" className="btn btn-danger btn-sm" onClick={this.state.deleteConfirmSubmit}><i className="fa fa-trash-o"></i> Delete</button>
              </Modal.Footer>
          </Modal>
        </div>
      }

    }

    return (
      <div>
        <ItemAddPage id={this.props.id} handleLoadItem={this.props.handleLoadItem} />
        {content}
      </div>

    );
  }
}

const Thumbnail = props =>  {
  let transcriptionStatus = props.page.transcription_status;
  let pageStatus = [];
  if (parseInt(transcriptionStatus,10)===0) {
    pageStatus = <small className="label label-success">Open</small>;
  }
  if (parseInt(transcriptionStatus,10)===1) {
    pageStatus = <small className="label label-warning">Completed</small>;
  }
  if (parseInt(transcriptionStatus,10)===2) {
    pageStatus = <small className="label label-danger">Approved</small>;
  }

  let archiveFilename = fixImagePath(props.page.archive_filename);
  let pageCount = props.i+1;
  let selectedClass = "";
  if (props.page.archive_filename===props.selectedPage) {
    selectedClass = " selected";
  }
  return(
    <div className={"item"+selectedClass}>
      <div className="btn btn-danger btn-xs remove-form-img" onClick={props.showDeleteConfirm.bind(this, props.page.archive_filename)}><i className="fa fa-trash"></i></div>
      <div className='img-thumbnail'
        onClick={props.function.bind(this,props.i,props.page.archive_filename)}
        >
        <div className="transcription-page-select-status">{pageStatus}</div>
        <img
          data-id={props.page.page_id}
          src={archivePath+'square_thumbnails/'+archiveFilename}
          alt=''
          className='img-responsive page-thumbnail' />
          <label className="item-count">{pageCount}</label>
      </div>
    </div>
  );
}
