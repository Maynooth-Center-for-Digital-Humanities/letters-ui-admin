import React from 'react';
import {archivePath} from '../../common/constants';
import {ToggleClass,fixImagePath} from '../../helpers/helpers';
import Resizable from 're-resizable';
import Draggable from 'react-draggable';

export default class TranscriptionImageViewer extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      imgWidth: "auto",
      imgHeight: "100%",
      positionX: 0,
      positionY: 0,
      fullScreenBtnClass: "fa-expand",
      fullScreenStatus: false,
      dragging:false
    };
    this.imgRef = React.createRef();
    this.handleStop = this.handleStop.bind(this);
    this.handleStart = this.handleStart.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
  }

  updateViewer(type) {
    let img = this.imgRef.current;
    let rect = img.getBoundingClientRect();
    let imgTop = rect.top;
    let imgRight = rect.right;
    let imgBottom = rect.bottom;
    let imgLeft = rect.left;
    let imgWidth = imgRight-imgLeft;
    let imgHeight = imgBottom-imgTop;
    if (type==="zoomin") {
      let newWidth = imgWidth + ((imgWidth*25)/100);
      let newHeight = imgHeight + ((imgHeight*25)/100);
      newWidth = newWidth+"px";
      newHeight = newHeight+"px";
      this.setState({
        imgWidth: newWidth,
        imgHeight: newHeight,
      });
      return false;
    }
    if (type==="zoomout") {
      let newWidth = imgWidth - ((imgWidth*25)/100);
      let newHeight = imgHeight - ((imgHeight*25)/100);
      if (newHeight<=400) {
        newWidth = "auto";
        newHeight = "400px";
      }
      else {
        newWidth = newWidth+"px";
        newHeight = newHeight+"px";
      }
      this.setState({
        imgWidth: newWidth,
        imgHeight: newHeight,
      });
      return false;
    }
    if (type==="scrollup") {
      let newImgTop = this.state.positionY;
      newImgTop = parseInt(newImgTop,10)-100;
      this.setState({
        positionY: newImgTop
      });
      return false;
    }
    if (type==="scrolldown") {
      let newImgTop = this.state.positionY;
      newImgTop = parseInt(newImgTop,10)+100;
      this.setState({
        positionY: newImgTop
      });
      return false;
    }
    if (type==="scrollright") {
      let newImgLeft = this.state.positionX;
      newImgLeft = parseInt(newImgLeft,10)+100;
      this.setState({
        positionX: newImgLeft
      });
      return false;
    }
    if (type==="scrollleft") {
      let newImgLeft = this.state.positionX;
      newImgLeft = parseInt(newImgLeft,10)-100;
      this.setState({
        positionX: newImgLeft
      });
      return false;
    }
    if (type==="expand") {
      this.toggleFullScreen();
      let container = document.getElementById("transcription-container");
      ToggleClass(container, "container", "container-fluid");
      return false;
    }
  }

  handleStop(e) {
    let img = this.imgRef.current;
    let imgTransform = img.style.transform;
    imgTransform = imgTransform.replace("translate(","").replace(")","");
    let imgTransformArr = imgTransform.split(",");
    let newX = imgTransformArr[0].trim().replace("px","");
    let newY = imgTransformArr[1].trim().replace("px","");
    this.setState({
      positionX: parseInt(newX,10),
      positionY: parseInt(newY,10),
      dragging: false
    });
    return false;
  }

  handleStart(e) {
    this.setState({
      dragging: true
    });
  }

  toggleFullScreen() {
    if (this.state.fullScreenStatus===false) {
      this.requestFullScreen(document.body);
      this.setState({
        fullScreenBtnClass: "fa-compress",
        fullScreenStatus: true
      });
      return false;
    }
    else {
      this.cancelFullScreen(document);
      this.setState({
        fullScreenBtnClass: "fa-expand",
        fullScreenStatus: false
      });
    }
  }

  cancelFullScreen(el) {
  	let requestMethod = el.cancelFullScreen||el.webkitCancelFullScreen||el.mozCancelFullScreen||el.exitFullscreen;
  	if (requestMethod) {
  		requestMethod.call(el);
  	}
  	return false;
  }

  requestFullScreen(el) {
  	let requestMethod = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (requestMethod) {
  		requestMethod.call(el);
  	}
    let context = this;
    setTimeout(function() {
      context.setState({
        iframeHeight: window.innerHeight
      });
    },1000);
  	return false;
  }

  render() {
    let pageSource = fixImagePath(archivePath+"fullsize/"+this.props.page.archive_filename);
    let imgStyle = {
      width: this.state.imgWidth,
      height: this.state.imgHeight
    }
    let draggingClass="";
    if (this.state.dragging) {
      draggingClass = " dragging";
    }
    let img = <Draggable
      defaultPosition={{x: 0, y: 0}}
      position={{x: this.state.positionX, y: this.state.positionY}}
      onStart={this.handleStart}
      onStop={this.handleStop}>
      <img draggable="false" ref={this.imgRef} className={"transcription-img"+draggingClass} src={pageSource} alt="" style={imgStyle}/>
    </Draggable>;
    let imgViewerHTML = <Resizable className="transcription-img-container" defaultSize={{
      width: "100%",
      height: 400,
    }}
    maxWidth="100%"
    minWidth="100%"
    >
      <div className="transcription-img-controllers">
        <ul>
          <li key={0}><a onClick={this.updateViewer.bind(this,"zoomin")}><i className="fa fa-plus"></i></a></li>
          <li key={1}><a onClick={this.updateViewer.bind(this,"zoomout")}><i className="fa fa-minus"></i></a></li>
          <li key={2}><a onClick={this.updateViewer.bind(this,"scrollup")}><i className="fa fa-caret-up"></i></a></li>
          <li key={3}><a onClick={this.updateViewer.bind(this,"scrolldown")}><i className="fa fa-caret-down"></i></a></li>
          <li key={4}><a onClick={this.updateViewer.bind(this,"scrollleft")}><i className="fa fa-caret-left"></i></a></li>
          <li key={5}><a onClick={this.updateViewer.bind(this,"scrollright")}><i className="fa fa-caret-right"></i></a></li>
          <li key={6}><a onClick={this.updateViewer.bind(this,"expand")}><i className={"fa "+this.state.fullScreenBtnClass}></i></a></li>
        </ul>
      </div>
      <div className="transcription-img-container-inner">
        {img}
      </div>
    </Resizable>;
    return (
      <div>
        {imgViewerHTML}
      </div>
    );
  }
}
