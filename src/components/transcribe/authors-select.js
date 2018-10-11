import React from 'react';
import {Creatable} from 'react-select';
import axios from 'axios';
import {APIPath} from '../../common/constants';

export default class AuthorsSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectOptions: []
    }
    this.loadItems = this.loadItems.bind(this);
  }

  loadItems() {
    if (sessionStorage.getItem("people_list")!==null && sessionStorage.getItem("people_list").length>0) {
      let data = JSON.parse(sessionStorage.getItem("people_list"));
      this.setItems(data);
    }
    else {
      let context = this;
      axios.get(APIPath+"people")
    	  .then(function (response) {
          let data = response.data.data;
          context.setItems(data);
        })
        .catch(function (error) {
    	    console.log(error);
    	});
    }
  }

  setItems(data) {
    let items = [];
    for (let i=0; i<data.length; i++) {
      let item = data[i];
      let row = { label: item, value: item };
      items.push(row);
    }
    this.setState({
      selectOptions: items
    });
  }

  componentDidMount() {
    this.loadItems();
  }

  render() {
    const selectOptions = this.state.selectOptions;
    return (
      <Creatable
        name={this.props.elementName}
        value={this.props.selected}
        onChange={this.props.onChangeFunction}
        options={selectOptions}
        isMulti={this.props.multi}
        removeSelected={this.props.removeSelected}
      />
    );
  }
}
