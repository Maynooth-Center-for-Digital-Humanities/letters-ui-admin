import React, {Component} from 'react';
import KeywordsSelect from '../components/transcribe/keywords-select';
import AuthorsSelect from '../components/transcribe/authors-select';
import SourcesSelect from '../components/transcribe/sources-select';

export default class AdvancedSearchFormRow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchInput: [],
      selectedOperators: [],
      buttonVisible: "add",
      disabled: false,
      selectType: "`element`->>'$.document_id'",
      operator: 'equals',
      inputValue: '',
      boolean_operator: 'and'
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleOperatorChange = this.handleOperatorChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSelectFormChange = this.handleSelectFormChange.bind(this);
    this.handleSelectFormPlainChange = this.handleSelectFormPlainChange.bind(this);
    this.addNewBlock = this.addNewBlock.bind(this);
    this.removeNewBlock = this.removeNewBlock.bind(this);
  }

  handleChange(e) {
    let value = e.target.value;
    let operator0 = ["`element`->>'$.document_id'","`element`->>'$.creator_gender'","`element`->>'$.language'",];
    let operator1 = ["`element`->>'$.title'","`element`->>'$.description'","`element`->>'$.creator'","`element`->>'$.recipient'","`element`->>'$.source'","`element`->>'$.doc_collection'","`element`->>'$.recipient_location'","`element`->>'$.creator_location'","notes","`fulltext`"];
    let operator2 = ["`element`->>'$.date_created'","`element`->>'$.year_of_death_of_author'","`element`->>'$.modified_timestamp'"];
    let operators;
    if (operator0.indexOf(value)>-1) {
      operators = <select className="form-control" onChange={this.handleOperatorChange.bind(this)}>
        <option value="equals">is exactly</option>
        <option value="empty">is empty</option>
        <option value="not_empty">is not empty</option>
      </select>;
    }
    if (operator1.indexOf(value)>-1) {
      operators = <select className="form-control" onChange={this.handleOperatorChange.bind(this)}>
        <option value="equals">is exactly</option>
        <option value="contains">contains</option>
        <option value="not_contains">does not contain</option>
        <option value="empty">is empty</option>
        <option value="not_empty">is not empty</option>
      </select>;
    }
    if (operator2.indexOf(value)>-1) {
      operators = <select className="form-control" onChange={this.handleOperatorChange.bind(this)}>
        <option value="equals">is exactly</option>
        <option value="empty">is empty</option>
        <option value="not_empty">is not empty</option>
        <option value="greater_than">Greater than</option>
        <option value="less_than">Less than</option>
      </select>;
    }
    if (value==="topics") {
    operators = <select className="form-control" onChange={this.handleOperatorChange.bind(this)}>
        <option value="has_keywords">has keywords</option>
      </select>;
    }

    this.setState({
      selectedOperators: operators,
      selectType: value,
      inputValue: '',
    });
    let context = this;
    setTimeout(function() {

      let query = {
        type: context.state.selectType,
        operator: "equals",
        value: context.state.inputValue,
        boolean_operator: context.state.boolean_operator,
        key: context.props.itemKey
      }
      context.props.update(query, context.props.itemKey);
    },100);

  }

  handleOperatorChange(e) {
    let value = e.target.value;
    let disabled = false;
    if (value==="empty" || value==="not_empty") {
      disabled = true;
    }
    this.setState({
      operator: value,
      disabled: disabled
    });

    let context = this;
    setTimeout(function() {
      let query = {
        type: context.state.selectType,
        operator: context.state.operator,
        value: context.state.inputValue,
        boolean_operator: context.state.boolean_operator,
        key: context.props.itemKey
      }
      context.props.update(query, context.props.itemKey);
    },100);
  }

  handleInputChange(e) {
    let value = e.target.value;
    this.setState({
      inputValue: value,
    });
    let context = this;
    setTimeout(function() {
      let query = {
        type: context.state.selectType,
        operator: context.state.operator,
        value: context.state.inputValue,
        boolean_operator: context.state.boolean_operator,
        key: context.props.itemKey
      }
      context.props.update(query, context.props.itemKey);
    },100);
  }

  handleSelectFormChange(elementName, multiple, selectValue) {
    this.setState({
      inputValue: selectValue
    });

    let context = this;
    setTimeout(function() {
      let query = {
        type: context.state.selectType,
        operator: context.state.operator,
        value: context.state.inputValue,
        boolean_operator: context.state.boolean_operator,
        key: context.props.itemKey
      }
      context.props.update(query, context.props.itemKey);
    },100);
  }

  handleSelectFormPlainChange(value) {
    this.setState({
      inputValue: value['value'],
    });
    let context = this;
    setTimeout(function() {
      let query = {
        type: context.state.selectType,
        operator: context.state.operator,
        value: context.state.inputValue,
        boolean_operator: context.state.boolean_operator,
        key: context.props.itemKey
      }
      context.props.update(query, context.props.itemKey);
    },100);
  }

  handleBooleanOperatorChange(e) {
    let value = e.target.value;
    this.setState({
      boolean_operator: value,
    });
    let context = this;
    setTimeout(function() {
      let query = {
        type: context.state.selectType,
        operator: context.state.operator,
        value: context.state.inputValue,
        boolean_operator: context.state.boolean_operator,
        key: context.props.itemKey
      }
      context.props.update(query, context.props.itemKey);
    },100);
  }

  addNewBlock() {
    this.setState({
      buttonVisible: "remove"
    });
    this.props.addBlock(this.props.itemKey);
  }

  removeNewBlock() {
    this.setState({
      buttonVisible: "add"
    });
    this.props.removeBlock(this.props.itemKey);
  }

  componentDidMount() {
    this.setState({
      selectedOperators: <select className="form-control" onChange={this.handleOperatorChange.bind(this)}>
        <option value="equals">is exactly</option>
        <option value="empty">is empty</option>
        <option value="not_empty">is not empty</option>
        </select>,
      buttonVisible: "add",
      disabled: '',
      selectType: "`element`->>'$.document_id'",
      operator: 'equals',
      inputValue: '',
      boolean_operator: 'and'
    });
  }

  render() {
    let queryBlockOptions = [
        <option key={0} value="`element`->>'$.document_id'">Document ID</option>,
        <option key={1} value="`element`->>'$.title'">Title</option>,
        <option key={2} value="`element`->>'$.description'">Description</option>,
        <option key={3} value="topics">Keywords</option>,
        <option key={4} value="`element`->>'$.date_created'">Date the letter was written</option>,
        <option key={5} value="`element`->>'$.creator'">Letter From</option>,
        <option key={6} value="`element`->>'$.creator_gender'">{"Author's gender"}</option>,
        <option key={7} value="`element`->>'$.recipient'">Letter To</option>,
        <option key={8} value="`element`->>'$.language'">Language</option>,
        <option key={9} value="`element`->>'$.source'">Source</option>,
        <option key={10} value="`element`->>'$.doc_collection'">Document Collection/Number</option>,
        <option key={11} value="`element`->>'$.recipient_location'">Place (letter sent to)</option>,
        <option key={12} value="`element`->>'$.creator_location'">Place (letter sent from)</option>,
        <option key={13} value="`element`->>'$.year_of_death_of_author'">Year of death of author</option>,
        <option key={14} value="notes">Notes</option>,
        <option key={15} value="`fulltext`">Transcription</option>,
        <option key={16} value="`element`->>'$.modified_timestamp'">Last modified date</option>,
    ]

    let addBtn = <button type="button" className="btn btn-sm btn-default" onClick={this.addNewBlock}><i className="fa fa-plus"></i></button>;
    if (this.state.buttonVisible==="remove") {
      addBtn = <button type="button" className="btn btn-sm btn-default" onClick={this.removeNewBlock}><i className="fa fa-minus"></i></button>;
    }

    let disabledAttr = "";
    if (this.state.disabled) {
      disabledAttr = "disabled";
    }
    let searchInput = <input type="text" className="form-control"
      onChange={this.handleInputChange.bind(this)}
      value={this.state.inputValue} disabled={disabledAttr} />;
    if (this.state.selectType==="topics") {
      searchInput = <KeywordsSelect
        elementName="keywords"
        multi={true}
        onChangeFunction={this.handleSelectFormChange.bind(this, "topics", true)}
        removeSelected={false} />;
    }
    if (this.state.selectType==="`element`->>'$.creator'" || this.state.selectType==="`element`->>'$.recipient'") {
      searchInput = <AuthorsSelect
        elementName="`element`->>'$.creator'"
        onChangeFunction={this.handleSelectFormPlainChange.bind(this)}
        multi={false}
        removeSelected={false}/>;
    }
    if (this.state.selectType==="`element`->>'$.source'") {
      searchInput = <SourcesSelect
        elementName="source"
        onChangeFunction={this.handleSelectFormPlainChange.bind(this)}
        multi={false}
        removeSelected={true}
        />
    }

    let queryBlock = <div className="row" key={this.props.itemKey}>
        <div className="col-xs-12 col-sm-2">
          <select className="form-control" value={this.state.selectType} onChange={this.handleChange.bind(this)}>
            {queryBlockOptions}
          </select>
        </div>
        <div className="col-xs-12 col-sm-2">
          {this.state.selectedOperators}
        </div>
        <div className="col-xs-12 col-sm-5" style={{position: "relative", zIndex: "999"}}>
          {searchInput}
        </div>
        <div className="col-xs-12 col-sm-2">
          <select name="boolean" className="form-control" onChange={this.handleBooleanOperatorChange.bind(this)}>
            <option value="and">And</option>
            <option value="or">Or</option>
          </select>
        </div>

        <div className="col-xs-12 col-sm-1">
          {addBtn}
        </div>
      </div>;
    return(
      <div className="advanced-search-from-row">{queryBlock}</div>
    )
  }
}
