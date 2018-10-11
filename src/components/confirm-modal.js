import React from 'react';
import {Modal} from 'react-bootstrap';

export default class ConfirmModal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			headerText: "",
			bodyText: "",
			buttonCancel: "",
			buttonSuccess: "",
			buttonCancelText: "",
			buttonSuccessText: "",
			showModal: false,
		};

		this.handleShow = this.handleShow.bind(this);
		this.handleClose = this.handleClose.bind(this);
	}

	handleClose() {
		this.setState({ showModal: false });
	}

	handleShow() {
		this.setState({ showModal: true });
	}

  componentDidUpdate(prevProps, prevState) {
    if (prevProps!==this.props) {
      this.setState({
        headerText: this.props.headerText,
  			bodyText: this.props.bodyText,
  			buttonCancel: this.props.buttonCancel,
  			buttonSuccess: this.props.buttonSuccess,
  			buttonCancelText: this.props.buttonCancelText,
  			buttonSuccessText: this.props.buttonSuccessText,
        returnFunction: this.props.returnFunction,
  			showModal: this.props.showModal,
      });
    }
  }

	render() {
    const newModal = (
      <Modal
        show={this.props.showDeleteConfirm}
        onHide={this.props.hideDeleteConfirm}
        bsSize="small"
        >
          <Modal.Header closeButton>
            <Modal.Title>{this.state.headerText}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.bodyText}
          </Modal.Body>
          <Modal.Footer>
            {this.state.buttonCancel}
            {this.state.buttonSuccess}
          </Modal.Footer>
      </Modal>
    );
  	return (
        <div>
          {newModal}
        </div>
  	);
	}
}
