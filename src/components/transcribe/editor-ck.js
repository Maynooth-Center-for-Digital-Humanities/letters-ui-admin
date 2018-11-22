import React from 'react';
import {editorExportTranscription, editorImportTranscription} from '../../helpers/xml-editor/xml-editor';
import axios from 'axios';
import {loadProgressBar} from 'axios-progress-bar';
import {APIPath} from '../../common/constants.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import {Controlled as CodeMirror} from 'react-codemirror2';
require('codemirror/mode/xml/xml');

let codeTimeout = null;
export default class TranscriptionEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      saving: [],
      error: [],
      docked: true,
      positionX: 0,
      positionY: 0,
      handle: false,
      isResizing: false,
      undockedWidth: 500,
      resize: false,
      width: '600px',
      height: 'auto',
      dragover: false,
      textarea_disabled: false,
      allowSave: false,
      transcription_content: "",
    }
    this.elementName = "editor_" + this.props.id;
    this.onInput = this.onInput.bind(this);
    this.updateTranscription = this.updateTranscription.bind(this);
    this.resetAllowSave = this.resetAllowSave.bind(this);
    this.resizing = this.resizing.bind(this);
    this.unsetResize = this.unsetResize.bind(this);
    this.updateEditorView = this.updateEditorView.bind(this);
    this.updateCode = this.updateCode.bind(this);
    this.postCode = this.postCode.bind(this);

    this.setHandle = this.setHandle.bind(this);
    this.startDrag = this.startDrag.bind(this);
    this.endDrag = this.endDrag.bind(this);
    this.dragStop = this.dragStop.bind(this);
    this.dragOver = this.dragOver.bind(this);
    this.dragEnter = this.dragEnter.bind(this);
    this.dragLeave = this.dragLeave.bind(this);

    // ref the editor
    this.editorRef = React.createRef();
    this.xmlEditorRef = React.createRef();
  }

  updateEditorView(newProps) {
    if (typeof newProps.page.transcription_status !=="undefined") {
      this.setState({
        textarea_disabled: false
      });
      this.updateTranscription(newProps.page.transcription);
    }
    else {
      this.setState({
        textarea_disabled: false
      });
      this.updateTranscription(newProps.page.transcription);
    }
  }

  componentDidMount() {

    loadProgressBar();
    let context = this;
    let newTranscription = "";
    if (typeof context.props.page.transcription_status !=="undefined") {
      if (parseInt(context.props.page.transcription_status,10)>0) {
        this.setState({
          textarea_disabled: true,
          allowSave: false
        });
      }
    }
    else {
      this.setState({
        textarea_disabled: false,
        allowSave: false
      });
    }

     if (window.CKEDITOR.instances[this.elementName]) {
      try {
        window.CKEDITOR.instances[this.elementName].destroy(true);
      } catch (e) {
        console.log(e);
      }
    }

    if (this.props.updatePages!==[]) {
      window.CKEDITOR.replace(this.elementName, {
        on: {
          instanceReady: function(e) {
            if (context.props.page.transcription!==null) {
              newTranscription = context.props.page.transcription;
            }
            context.updateTranscription(newTranscription);

            // add change event listener
            let inputTimeout = null;
            window.CKEDITOR.instances[context.elementName].on('change', function (e) {
              if (!context.state.allowSave) {
                e.stop();
                e.cancel();
                return false;
              }
              let data = window.CKEDITOR.instances[this.elementName].getData();
              if (inputTimeout !== null) {
                clearTimeout(inputTimeout);
              }
              this.props.disableNav();
              inputTimeout = setTimeout(function () {
                context.onInput(data);
              }, 2000);

            }.bind(context));


          }
        }
      });
    }


    // dragging
    window.addEventListener('dragover', this.dragOver);
    window.addEventListener('drop', this.endDrag);

    // xml-editor
    this.setState({
      transcription_content:this.props.page.transcription,
      allowSave: false,
    });
    setTimeout(function() {
      context.resetAllowSave();
    },50);
  }

  componentWillUnmount() {
    window.removeEventListener('dragover', this.dragOver);
    window.removeEventListener('drop', this.endDrag);
  }


  componentWillReceiveProps(newProps) {
    if (
        newProps.page.transcription!==this.props.page.transcription
        || newProps.page.transcription_status!==this.props.page.transcription_status
        || newProps.page.archive_filename!==this.props.page.archive_filename
      ) {
      this.updateEditorView(newProps);

      this.setState({
        transcription_content:newProps.page.transcription,
        allowSave: false,
      });
      let context = this;
      setTimeout(function() {
        context.resetAllowSave();
      },50);
    }
  }

  onInput(data) {
    if (this.state.allowSave) {
      this.setState({
        saving: <span><i>Saving</i> <i className="fa fa-spin fa-circle-o-notch"></i></span>
      })
      let letterId = this.props.letterId;
      let archiveFilename = this.props.page.archive_filename;
      let newData = "";
      if (data!=="") {
        newData = editorExportTranscription(data);
      }

      let context = this;
      let path = APIPath+"admin/update-letter-transcription-page/"+letterId;
      let accessToken = sessionStorage.getItem('adminAccessToken');
      axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
      axios({
        method: 'POST',
        url: path,
        crossDomain: true,
        data: {"archive_filename": archiveFilename, "transcription": newData}
      })
      .then(function (response) {
        if (response.data.status) {
          context.setState({
            saving: []
          });
          context.props.updatePages(response.data.data);
        }
        else {
          let newError = {
            error: true,
            msg: response.data.message
          };
          context.props.error(newError);
          context.setState({
            saving: <span><i>Save error </i> <i className="fa fa-times"></i></span>
          });
          setTimeout(function() {
            context.setState({
              saving: []
            });
          },1000);
        }
        context.props.enableNav();
      })
      .catch(function (error) {
        console.log(error);
      });
    }
  }

  updateTranscription(data) {
    let context = this;
    let contentMarkup = editorImportTranscription(data);
    if (window.CKEDITOR.instances[context.elementName]!==null) {
      context.setState({
        allowSave: false,
      });
      setTimeout(function() {
        window.CKEDITOR.instances[context.elementName].setData(contentMarkup, context.resetAllowSave);
      },50);
    }

  }

  updateCode(editor, data, value) {
    let context = this;
    if (codeTimeout !== null) {
      clearTimeout(codeTimeout);
    }
    codeTimeout = setTimeout(function () {
      context.postCode(value)
    }, 2000);

  }

  postCode(value) {
    if (this.state.allowSave) {
      let context = this;
      this.props.disableNav();

      context.setState({
        saving: <span><i>Saving</i> <i className="fa fa-spin fa-circle-o-notch"></i></span>
      })
      let letterId = context.props.letterId;
      let archiveFilename = context.props.page.archive_filename;

      let path = APIPath+"admin/update-letter-transcription-page/"+letterId;
      let accessToken = sessionStorage.getItem('adminAccessToken');
      axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
      axios({
        method: 'POST',
        url: path,
        crossDomain: true,
        data: {"archive_filename": archiveFilename, "transcription": value}
      })
      .then(function (response) {
        if (response.data.status) {
          context.setState({
            saving: []
          });
          context.props.updatePages(response.data.data);
        }
        else {
          let newError = {
            error: true,
            msg: response.data.message
          };
          context.props.error(newError);
          context.setState({
            saving: <span><i>Save error </i> <i className="fa fa-times"></i></span>
          });
          setTimeout(function() {
            context.setState({
              saving: []
            });
          },1000);
        }
        context.props.enableNav();
      })
      .catch(function (error) {
        console.log(error);
      });

    }
  }

  resetAllowSave() {
    let context = this;
    setTimeout(function() {
      context.setState({
        allowSave: true
      });
    }, 50);
  }

  // drag
  setHandle(e) {
    this.setState({
      handle: true
    });
  }

  unsetHandle(e) {
    e.preventDefault();
    let context = this;
    setTimeout(function() {
      context.setState({
        handle: false
      });
    },50);
  }

  startDrag(e) {
    e.stopPropagation();
    // make sure the element is only draggable by its handle
    if (!this.state.handle) {
      e.preventDefault();
    }
    else {
      e.dataTransfer.setData("text/html", e.target.id);
      e.dataTransfer.dropEffect = "move";
    }
  }

  endDrag(e) {
    let newX = e.clientX - this.state.undockedWidth - 78;
    let newY = e.clientY - 19;
    this.setState({
      handle: false,
      docked: false,
      positionX: newX,
      positionY: newY,
      dragover: false,
    });
    return false;
  }

  // dock
  dragStop(e) {
    let context = this;
    setTimeout(function() {
      context.setState({
        docked: true,
        positionX: 0,
        positionY: 0,
        handle: false,
        dragover: false
      });
    },50);
    e.stopPropagation();
    e.preventDefault();
    return false;
  }

  dragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    return false;
  }

  dragEnter(e) {
    this.setState({
      dragover: true
    });
    e.preventDefault();
    e.stopPropagation();
  }

  dragLeave(e) {
    this.setState({
      dragover: false
    });
    e.preventDefault();
    return false;
  }

  // resize
  setResize(e) {
    e.preventDefault();
    this.setState({
      resize: true
    });
  }

  unsetResize(e) {
    e.preventDefault();
    this.setState({
      resize: false
    });
  }

  resizeMouseMove(e) {
    if( this.state.resize ){
      this.resizing(e.clientX, e.clientY);
    }
  }

  resizing(clientX, clientY){
    let node = this.editorRef.current;
    let width = clientX - node.offsetLeft + (16 / 2);
    let height = clientY - node.offsetTop  + (16 / 2);
    this.setState({
      width: width,
      height: height,
    });
  }

  render() {
    //let resizeHandleClass="hidden";
    let undockedStyle = [];
    let dropzoneClass = "";
    if (!this.state.docked) {
      undockedStyle = {
        'position': 'fixed',
        'top': this.state.positionY,
        'left': this.state.positionX,
        'zIndex':'999',
        'width': this.state.width,
        'height': this.state.height
      };
      //resizeHandleClass = "";
      dropzoneClass = " active";
    }
    let dragOverClass="";
    if (this.state.dragover) {
      dragOverClass = " over";
    }
    /*let resizeHandle = <div
      className={"transcription-editor-resize-handle "+resizeHandleClass}
        onMouseDown={this.setResize.bind(this)}
      >
      </div>;
    resizeHandle = [];*/

    let dragHandle = <div
      className="transcription-editor-move-handle"
      onMouseDown={this.setHandle.bind(this)}
      onMouseUp={this.unsetHandle.bind(this)}
      >
      <i className="fa fa-arrows"></i>
    </div>;

    // output
    let editorVisibleClass="";
    let content;
    if (this.props.editorType==="xml") {
      let codeMirrorOptions = {
        mode: 'xml',
        smartIndent: true,
        lineNumbers: true,
        readOnly: false,
        //theme: 'material',
      }
      let codeContent = "";
      if (this.state.transcription_content!=="") {
        codeContent = this.state.transcription_content.replace(/\\(.)/mg, "$1");
      }

      editorVisibleClass = "hidden";
      content = <div
        className="xml-editor"
        id="xml-editor"
        ref={this.xmlEditorRef}
        style={undockedStyle}
        draggable="true"
        onDragStart={this.startDrag.bind(this)}
        >
        <div className="xml-editor-bar">
          <div
            className="xml-editor-move-handle"
            onMouseDown={this.setHandle.bind(this)}
            onMouseUp={this.unsetHandle.bind(this)}
            >
              <i className="fa fa-arrows"></i>
            </div>
        </div>
        <CodeMirror
          onChange={(editor, data, value)=> {
            this.updateCode(editor, data, value);
          }}
          onBeforeChange={(editor, data, value) => {
            this.setState({transcription_content: value});
          }}
          value={codeContent} options={codeMirrorOptions} />
        <div className="transcription-saving-container">
          <div className="transcription-saving">{this.state.saving}</div>
        </div>
      </div>

    }

    return (
      <div>
        {content}
          <div
            className={"transcription-editor-dropzone"+dropzoneClass+dragOverClass}
            onDrop={this.dragStop.bind(this)}
            onDragEnter={this.dragEnter.bind(this)}
            onDragOver={this.dragOver.bind(this)}
            onDragLeave={this.dragLeave.bind(this)}
            >
          </div>
          <div className={editorVisibleClass}>
            <div
              id="transcription-editor"
              className="transcription-editor"
              ref={this.editorRef}
              style={undockedStyle}
              draggable="true"
              onDragStart={this.startDrag.bind(this)}
              >
              {dragHandle}
                <div className="transcription-saving-container">
                  <div className="transcription-saving">{this.state.saving}</div>
                </div>
                <textarea name={this.elementName}></textarea>
            </div>
        </div>
      </div>
    );
  }
}
