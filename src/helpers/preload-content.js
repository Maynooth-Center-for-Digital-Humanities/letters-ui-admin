//import React from 'react';
import axios from 'axios';
import {APIPath} from '../common/constants.js';

export function preloadContent() {
  sessionStorage.setItem('topics_list',[]);
  sessionStorage.setItem('sources_list',[]);
  sessionStorage.setItem('authors_list',[]);
  sessionStorage.setItem('genders_list',[]);
  sessionStorage.setItem('languages_list',[]);
  sessionStorage.setItem('date_created_list',[]);
  loadTopics();
  loadSources();
  loadAuthors();
  loadGenders();
  loadLanguages();
  loadDateCreated();

}

function loadTopics() {
  axios.get(APIPath+"topics")
	  .then(function (response) {
      let data = response.data.data;
      sessionStorage.setItem('topics_list', JSON.stringify(data));
    })
    .catch(function (error) {
	    console.log(error);
	});
}

function loadSources() {
  axios.get(APIPath+"sources")
	  .then(function (response) {
      let data = response.data.data;
      sessionStorage.setItem('sources_list', JSON.stringify(data));
    })
    .catch(function (error) {
	    console.log(error);
	});
}

function loadAuthors() {
  axios.get(APIPath+"authors")
	  .then(function (response) {
      let data = response.data.data;
      sessionStorage.setItem('authors_list', JSON.stringify(data));
    })
    .catch(function (error) {
	    console.log(error);
	});
}

function loadGenders() {
  axios.get(APIPath+"genders")
	  .then(function (response) {
      let data = response.data.data;
      sessionStorage.setItem('genders_list', JSON.stringify(data));
    })
    .catch(function (error) {
	    console.log(error);
	});
}


function loadLanguages() {
  axios.get(APIPath+"languages")
	  .then(function (response) {
      let data = response.data.data;
      sessionStorage.setItem('languages_list', JSON.stringify(data));
    })
    .catch(function (error) {
	    console.log(error);
	});
}

function loadDateCreated() {
  axios.get(APIPath+"date_created")
	  .then(function (response) {
      let data = response.data.data;
      sessionStorage.setItem('date_created_list', JSON.stringify(data));
    })
    .catch(function (error) {
	    console.log(error);
	});
}
