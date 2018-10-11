import React from 'react';
import PropTypes from 'prop-types';

export default class Address extends Component {
  constructor(props, context) {
    super(props, context);

    this.onChange = this.onChange.bind(this);
  }
  /*static propTypes = {
    expanded: PropTypes.bool,
    onExpandEvent: PropTypes.func,
    onChange: PropTypes.func,
    currentState: PropTypes.object,
  };*/

  stopPropagation = (event) => {
    event.stopPropagation();
  };

  onChange(value){
    let { onChange } = this.props;
  }

  renderModal = () => {
    const { color } = this.props.currentState;
    return (
      <div
        onClick={this.stopPropagation}
      >
        <BlockPicker color={color} onChangeComplete={this.onChange} />
      </div>
    );
  };

  render() {
    const { expanded, onExpandEvent } = this.props;
    return (
      <div
        aria-haspopup="true"
        aria-expanded={expanded}
        aria-label="rdw-color-picker"
      >
        <div
          onClick={onExpandEvent}
        >
          <img
            src={icon}
            alt=""
          />
        </div>
        {expanded ? this.renderModal() : undefined}
      </div>
    );
  }
}
