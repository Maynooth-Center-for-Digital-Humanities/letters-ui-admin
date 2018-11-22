import React, {Component} from 'react';
import axios from 'axios';

import {APIPath} from '../common/constants';
import {calculateDaysInMonth} from '../helpers/helpers';
import {loadProgressBar} from 'axios-progress-bar';

import KeywordsSelect from '../components/transcribe/keywords-select';
import AuthorsSelect from '../components/transcribe/authors-select';
import SourcesSelect from '../components/transcribe/sources-select';

export default class ItemForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: {
        title: false,
        language: false,
        source: false,
      },
      generic_error:false,
      generic_error_txt:'',
      daysOptions: [],
      submitStatus:false,
      updateBtnText: <span><i className="fa fa-save"></i> Save</span>,
      // form
      title: "",
      document_id: "",
      additional_information: "",
      keywords: [],
      year: "1915",
      month: "",
      day: "",
      creator: [],
      creator_gender: "",
      recipient: [],
      language: "",
      source: [],
      doc_collection: "",
      recipient_location: "",
      creator_location: "",
      year_of_death_of_author: "",
      notes: "",
    }
    this.loadItem = this.loadItem.bind(this);
    this.assignItemStateValues = this.assignItemStateValues.bind(this);
    this.calculateDays = this.calculateDays.bind(this);
    this.yearOfDeathList = this.yearOfDeathList.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
    this.handleSelectFormChange = this.handleSelectFormChange.bind(this);
    this.errorValidation = this.errorValidation.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
  }

  loadItem() {
    this.assignItemStateValues(this.props.item);
  }

  assignItemStateValues(itemData) {
    let date = itemData.date_created;
    let dateArr = date.split("-");
    let year = dateArr[0];
    let month = "";
    let day = "";
    if (typeof dateArr[1]!== undefined) {
      month = dateArr[1];
    }
    if (typeof dateArr[2]!== undefined) {
      this.calculateDays(year,month);
      day = dateArr[2];
    }

    let keywordsData = [];
    let topics = itemData.topics;
    for (let i=0;i<topics.length; i++) {
      let topic = topics[i];
      let newValue = topic.topic_name+"-"+topic.topic_id;
      keywordsData.push({ label: topic.topic_name, value: newValue, topic_id: topic.topic_id});
    }
    let itemTitle = itemData.title;
    if (itemData.title===null) {
      itemTitle = "";
    }
    let itemDocumentId = itemData.document_id;
    if (itemData.document_id===null) {
      itemDocumentId = "";
    }
    let itemAdditionalInformation = itemData.description;
    if (itemData.description===null) {
      itemAdditionalInformation = "";
    }
    let itemCreator = { label: itemData.creator, value: itemData.creator };
    if (itemData.creator===null) {
      itemCreator = [];
    }
    let itemCreatorGender = itemData.creator_gender;
    if (itemData.creator_gender===null) {
      itemCreatorGender = "";
    }
    let itemRecipient = { label: itemData.recipient, value: itemData.recipient };
    if (itemData.recipient===null) {
      itemRecipient = [];
    }
    let itemLanguage = itemData.language;
    if (itemData.language===null) {
      itemLanguage = "";
    }
    let itemSource = { label: itemData.source, value: itemData.source };
    if (itemData.source===null) {
      itemSource = [];
    }
    let itemDocCollection = itemData.doc_collection;
    if (itemData.doc_collection===null) {
      itemDocCollection = "";
    }
    let itemRecipientLocation = itemData.recipient_location;
    if (itemData.recipient_location===null) {
      itemRecipientLocation = "";
    }
    let itemCreatorLocation = itemData.creator_location;
    if (itemData.creator_location===null) {
      itemCreatorLocation = "";
    }
    let itemYearOfDeathOfAuthor = itemData.year_of_death_of_author;
    if (itemData.year_of_death_of_author===null) {
      itemYearOfDeathOfAuthor = "";
    }
    let itemNotes = itemData.notes;
    if (itemData.notes===null) {
      itemNotes = "";
    }

    this.setState({
      title: itemTitle,
      document_id: itemDocumentId,
      additional_information: itemAdditionalInformation,
      keywords: keywordsData,
      year: year,
      month: month,
      day: day,
      creator: itemCreator,
      creator_gender: itemCreatorGender,
      recipient: itemRecipient,
      language: itemLanguage,
      source: itemSource,
      doc_collection: itemDocCollection,
      recipient_location: itemRecipientLocation,
      creator_location: itemCreatorLocation,
      year_of_death_of_author: itemYearOfDeathOfAuthor,
      notes: itemNotes,
    });
  }

  calculateDays(year,month) {
    month = parseInt(month,10)-1;
    let days = calculateDaysInMonth(year,month);
    let daysOptions = [<option key={0} value=""> -- </option>];
    for (let i=1; i<=days; i++) {
      let day = i;
      if (i<10) {
        day = "0"+i;
      }
      daysOptions.push(<option key={i} value={day}>{day}</option>);
    }
    this.setState({
      daysOptions: daysOptions
    });
  }

  yearOfDeathList() {
    let thisYear = new Date().getFullYear();
    let optionsList = [];
    optionsList.push(<option value="" key={0}> -- </option>);
    for (let year=1915; year<=thisYear; year++) {
      optionsList.push(<option key={year} value={year}>{year}</option>);
    }
    return optionsList;
  }

  handleFormChange(e) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;

    if (name==="month") {
      let year = parseInt(this.state.year,10);
      let month = parseInt(value,10)-1;
      this.calculateDays(year,month);
    }
    if (name==="year") {
      let year = parseInt(value,10);
      if (this.state.month!=="") {
        let month = parseInt(this.state.month,10)-1;
        this.calculateDays(year,month);
      }
    }
    this.setState({
      [name]: value
    });
  }

  handleSelectFormChange(elementName, multiple, selectValue) {
    this.setState({
      [elementName]: selectValue
    });
  }

  errorValidation() {
    let errorsTitle = false;
    let errorsLanguage = false;
    let errorsSource = false;
    let returnValue = true;
    if (this.state.title.trim().length===0) {
      errorsTitle = true;
      returnValue = false;
    }
    if (this.state.language==="") {
      errorsLanguage = true;
      returnValue = false;
    }
    if (this.state.source.label==="" || this.state.source.label===[]) {
      errorsSource = true;
      returnValue = false;
    }
    this.setState({
      errors: {
        title: errorsTitle,
        language: errorsLanguage,
        source: errorsSource,
      },
    });
    return returnValue;
  }

  formSubmit(e) {
    e.preventDefault();
    const validation = this.errorValidation();
    if (!validation) {
      return false;
    }
    let submitStatus= this.state.submitStatus;
    if (submitStatus) {
      return false;
    }
    this.setState({
      submitStatus: true,
      updateBtnText: <span>Saving... <i className="fa fa-circle-o-notch fa-spin"></i></span>
    });
    let itemId = this.props.id;
    let context = this;
    let postArray = {
      id: itemId,
      document_id: this.state.document_id,
      title: this.state.title,
      additional_information: this.state.additional_information,
      keywords: this.state.keywords,
      year: this.state.year,
      month: this.state.month,
      day: this.state.day,
      creator: this.state.creator['value'],
      creator_gender: this.state.creator_gender,
      recipient: this.state.recipient['value'],
      language: this.state.language,
      source: this.state.source['value'],
      doc_collection: this.state.doc_collection,
      recipient_location: this.state.recipient_location,
      creator_location: this.state.creator_location,
      year_of_death_of_author: this.state.year_of_death_of_author,
      notes: this.state.notes,
    }

    let accessToken = sessionStorage.getItem('adminAccessToken');
    axios.defaults.headers.common['Authorization'] = 'Bearer '+accessToken;
    axios({
      method: 'POST',
      url: APIPath+'admin/update-entry/'+itemId,
      data: postArray,
      crossDomain: true,
    })
	  .then(function (response) {
      submitStatus = 0;
      if (response.data.status===true) {
        if (parseInt(itemId,10)===0) {
          context.setState({
            updateBtnText: <span>Saved successfully <i className="fa fa-check"></i></span>,
            generic_error: false,
            generic_error_txt:''
          });
          setTimeout(function() {
            context.setState({
              upload_loader: false,
              progress_bar_text: "",
              progress_bar_width:0,
              redirect: true,
              updateBtnText: <span><i className="fa fa-save"></i> Save</span>,
              submitStatus: 0,
            });
          },1000);
        }
        else if (parseInt(itemId,10)>0) {
          context.setState({
            updateBtnText: <span>Saved successfully <i className="fa fa-check"></i></span>,
            generic_error: false,
            generic_error_txt:''
          });
          setTimeout(function() {
            context.setState({
              updateBtnText: <span><i className="fa fa-save"></i> Save</span>,
              submitStatus: 0,
            });
          },1000);
        }
      }
      else if (response.data.status===false) {
        let errorsOutput = [];
        let errorCount=0;
        for (let error in response.data.errors) {
          errorsOutput.push(<span key={errorCount} style={{display:"block"}}>{response.data.errors[error]}</span>);
          errorCount++;
        }
        context.setState({
          updateBtnText: <span>Error saving... <i className="fa fa-times"></i></span>,
          submitStatus: 0,
          generic_error: true,
          generic_error_txt: errorsOutput
        });
        setTimeout(function() {
          context.setState({
            updateBtnText: <span><i className="fa fa-save"></i> Save</span>,
          });
        },1000);
      }
	  })
	  .catch(function (error) {
	    console.log(error);
	  });
  }

  componentDidMount() {
    this.loadItem();
    loadProgressBar();
  }

  render() {
    let content;
    let yearOfDeathListValues = this.yearOfDeathList();

    let titleErrorClass = "";
    let languageErrorClass = "";
    let sourceErrorClass = "";
    let errorText = "";
    let errorContainerVisible = "";
    if (this.state.errors['source']) {
      sourceErrorClass = " input-error";
      errorText = "Please set a Source to continue.";
      errorContainerVisible = "visible";
    }
    if (this.state.errors['language']) {
      languageErrorClass = " input-error";
      errorText = "Please select Language to continue.";
      errorContainerVisible = "visible";
    }
    if (this.state.errors['title']) {
      titleErrorClass = " input-error";
      errorText = "Please enter Title to continue.";
      errorContainerVisible = "visible";
    }
    if (this.state.generic_error) {
      errorText = this.state.generic_error_txt;
      errorContainerVisible = "visible";
    }
    content = <form onSubmit={this.formSubmit}>
      <div className="form-group">
        <label>Document id: </label>{this.state.document_id}
      </div>
      <div className="form-group">
        <label><sup>*</sup>Title/Caption</label>
        <input className={"form-control"+titleErrorClass} type="text" name="title" onChange={this.handleFormChange.bind(this)} value={this.state.title} />
      </div>

      <div className="form-group">
        <label>Additional Information</label>
        <textarea className="form-control" name="additional_information" onChange={this.handleFormChange.bind(this)} value={this.state.additional_information}></textarea>
      </div>

      <div className="form-group">
        <label>Keywords</label>
        <KeywordsSelect
          elementName="keywords"
          onChangeFunction={this.handleSelectFormChange.bind(this, "keywords", true)}
          multi={true}
          selected={this.state.keywords}
          removeSelected={false}/>
      </div>

      <div className="form-group">
        <label>Date the letter was written</label>
        <div className="row">
          <div className="col-xs-12 col-sm-4">
            <select className="form-control" name="year" onChange={this.handleFormChange.bind(this)} value={this.state.year}>
              <option value="1915">1915</option>
              <option value="1916">1916</option>
              <option value="1917">1917</option>
              <option value="1918">1918</option>
              <option value="1919">1919</option>
              <option value="1920">1920</option>
              <option value="1921">1921</option>
              <option value="1922">1922</option>
              <option value="1923">1923</option>
            </select>
          </div>
          <div className="col-xs-12 col-sm-4">
            <select className="form-control" name="month" onChange={this.handleFormChange.bind(this)} value={this.state.month}>
              <option value="">--</option>
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
          <div className="col-xs-12 col-sm-4">
            <select className="form-control" name="day" onChange={this.handleFormChange.bind(this)} value={this.state.day}>
              {this.state.daysOptions}
            </select>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Letter From</label>
        <AuthorsSelect
          elementName="creator"
          onChangeFunction={this.handleSelectFormChange.bind(this, "creator", false)}
          multi={false}
          selected={this.state.creator}
          removeSelected={true}/>
      </div>

      <div className="form-group">
        <label>{"Author's gender"}</label>
        <div className="row">
          <div className="col-xs-12 col-sm-4">
            <select className="form-control" name="creator_gender" onChange={this.handleFormChange.bind(this)} value={this.state.creator_gender}>
              <option value="">--</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Letter To</label>
        <AuthorsSelect
          elementName="recipient"
          onChangeFunction={this.handleSelectFormChange.bind(this, "recipient", true)}
          multi={false}
          selected={this.state.recipient}
          removeSelected={true} />
      </div>

      <div className="form-group">
        <div className={"error-container"}>
          <p>Error Saving! Please select the <b>Language the letter is written in</b> of the letter to continue.</p>
        </div>
        <label><sup>*</sup>Language the letter is written in</label>
        <div className="row">
          <div className="col-xs-12 col-sm-4">
            <select className={"form-control"+languageErrorClass} name="language" onChange={this.handleFormChange.bind(this)} value={this.state.language}>
              <option value="">--</option>
              <option value="Irish">Irish</option>
              <option value="English">English</option>
              <option value="French">French</option>
              <option value="German">German</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className={"error-container"}>
          <p>Error Saving! Please enter the <b>Source</b> of the letter to continue.</p>
        </div>
        <label><sup>*</sup>Source</label>
          <SourcesSelect
            elementName="source"
            onChangeFunction={this.handleSelectFormChange.bind(this, "source", false)}
            multi={false}
            selected={this.state.source}
            removeSelected={true}
            className={sourceErrorClass}
            />
      </div>

      <div className="form-group">
        <label>Document Collection/Number</label>
        <input className="form-control" type="text" name="doc_collection" onChange={this.handleFormChange.bind(this)} value={this.state.doc_collection}/>
      </div>

      <div className="form-group">
        <label>Place (letter sent to)</label>
        <input className="form-control" type="text" name="recipient_location" onChange={this.handleFormChange.bind(this)} value={this.state.recipient_location}/>
      </div>

      <div className="form-group">
        <label>Place (letter sent from)</label>
        <input className="form-control" type="text" name="creator_location" onChange={this.handleFormChange.bind(this)} value={this.state.creator_location}/>
      </div>

      <div className="form-group">
        <label>Year of death of author</label>
        <div className="row">
          <div className="col-xs-12 col-sm-4">
            <select className="form-control" name="year_of_death_of_author" onChange={this.handleFormChange.bind(this)} value={this.state.year_of_death_of_author}>
              {yearOfDeathListValues}
            </select>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Additional Notes</label>
        <textarea className="form-control" name="notes" onChange={this.handleFormChange.bind(this)} value={this.state.notes}></textarea>
      </div>

      <div className={"error-container "+errorContainerVisible}>
        <p>{errorText}</p>
      </div>

      <div className="text-center">
        <button className="btn btn-letters" type="submit">{this.state.updateBtnText}</button>
      </div>

    </form>;


    return(
      <div className="row">
        <div className="col-xs-12" style={{padding: "15px"}}>
          {content}
        </div>
      </div>
    );
  }
}
