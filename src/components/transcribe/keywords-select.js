import React from 'react';
import createClass from 'create-react-class';
import PropTypes from 'prop-types';
import Select from 'react-select';
import axios from 'axios';
import {APIPath} from '../../common/constants';
import {flattenDeep} from '../../helpers/helpers';

export default class KeywordsSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      keywordsOptions: [],
      selectedOption: [],
    }
    this.loadKeywords = this.loadKeywords.bind(this);
  }

  loadKeywords() {
    if (sessionStorage.getItem("topics_list")!==null && sessionStorage.getItem("topics_list").length>0) {
      let data = JSON.parse(sessionStorage.getItem("topics_list"));
      let keywords = [];
      for (let i=0; i<data.length; i++) {
        let item = data[i];
        let keyword = this.keywordItem(item, 0);
        keywords.push(keyword);
      }
      this.setState({
        keywordsOptions: keywords
      });
    }
    else {
      let context = this;
      axios.get(APIPath+"topics")
    	  .then(function (response) {
          let data = response.data.data;
          let keywords = [];
          for (let i=0; i<data.length; i++) {
            let item = data[i];
            let keyword = context.keywordItem(item, 0);
            keywords.push(keyword);
          }
          context.setState({
            keywordsOptions: keywords
          });
        })
        .catch(function (error) {
    	    console.log(error);
    	});
    }
  }

  keywordItem(item, isChild) {
    let children = item.children;
    let keywordChildren = [];
    let keyword = [{ label: item.name, value: item.id, topic_id: item.id, child: isChild }];
    if (children.length>0) {
      keywordChildren = this.keywordChildren(children, 1);
      keyword.push(keywordChildren);
    }
    return keyword;
  }

  keywordChildren(children, isChild) {
    let childrenItems = [];
    if (children.length>0) {
      for (let j=0; j<children.length; j++) {
        let child = children[j];
        let childItem = this.keywordItem(child, isChild);
        childrenItems.push(childItem);
      }
    }

    return childrenItems;
  }

  componentDidMount() {
    this.loadKeywords();
  }

  render() {
    const keywordsOptions = this.state.keywordsOptions;
    let flattenedOptions = flattenDeep(keywordsOptions);
    return (
      <Select
        name={this.props.elementName}
        value={this.props.selected}
        onChange={this.props.onChangeFunction}
        options={flattenedOptions}
        isMulti={this.props.multi}
        removeSelected={this.props.removeSelected}
        optionComponent={ListItemOption}
      />
    );
  }
}

const ListItemOption = createClass({
	propTypes: {
		children: PropTypes.node,
		className: PropTypes.string,
		isDisabled: PropTypes.bool,
		isFocused: PropTypes.bool,
		isSelected: PropTypes.bool,
		onFocus: PropTypes.func,
		onSelect: PropTypes.func,
		option: PropTypes.object.isRequired,
    key: PropTypes.string
	},
	handleMouseDown (event) {
		event.preventDefault();
		event.stopPropagation();
		this.props.onSelect(this.props.option, event);
	},
	handleMouseEnter (event) {
		this.props.onFocus(this.props.option, event);
	},
	handleMouseMove (event) {
		if (this.props.isFocused) return;
		this.props.onFocus(this.props.option, event);
	},
	render () {
    let childClass = "";
    if (parseInt(this.props.option.child,10)>0) {
      childClass = " select-child";
    }
		return (
			<div className={this.props.className+childClass}
				onMouseDown={this.handleMouseDown}
				onMouseEnter={this.handleMouseEnter}
				onMouseMove={this.handleMouseMove}
				title={this.props.option.title}
        key={"select-"+this.props.option.label}>
				{this.props.children}
			</div>
		);
	}
});
