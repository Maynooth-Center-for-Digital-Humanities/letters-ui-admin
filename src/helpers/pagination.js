import React, {Component} from 'react';

export default class Pagination extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paginationItems: []
    };
  }

  createPagination() {
    // pagination
    if (this.props) {
      let currentPage = this.props.current_page;
      let lastPage = this.props.total_pages;
      let prevPage = 0;
      let nextPage = 0;

      if (currentPage<lastPage) {
        nextPage = currentPage+1;
      }
      if (currentPage>1) {
        prevPage = currentPage-1;
      }
      let paginationItems = [];
      let paginationFirstItem = <li key="first"><a onClick={this.props.pagination_function.bind(this,1)}><i className="fa-step-backward fa"></i></a></li>;
      let paginationPrevItem = <li key="prev"><a onClick={this.props.pagination_function.bind(this,prevPage)}><i className="fa-backward fa"></i></a></li>;
      paginationItems.push(paginationFirstItem);
      paginationItems.push(paginationPrevItem);

      for (let j=0; j<parseInt(lastPage,10);j++) {
        let pageNum = j+1;
        let pageActive = "";

        if (currentPage===pageNum) {
          pageActive = "active";
        }

        let paginationItem =  <li key={pageNum} className={pageActive}><a onClick={this.props.pagination_function.bind(this,pageNum)}>{pageNum}</a></li>;
        if (pageActive === "active") {
          paginationItem = <li key={pageNum} className={pageActive}><span>{pageNum}</span></li>;
        }

        if (parseInt(currentPage,10)<4 && j<10) {
          paginationItems.push(paginationItem);
        }
        else if (j>(parseInt(currentPage,10)-6) && j<(parseInt(currentPage,10)+4) ){
          paginationItems.push(paginationItem);
        }
      }
      let paginationNextItem = <li key="next"><a onClick={this.props.pagination_function.bind(this,nextPage)}><i className="fa-forward fa"></i></a></li>;
      let paginationLastItem = <li key="last"><a onClick={this.props.pagination_function.bind(this,lastPage)}><i className="fa-step-forward fa"></i></a></li>;
      paginationItems.push(paginationNextItem);
      paginationItems.push(paginationLastItem);
      this.setState({
        paginationItems: paginationItems
      });
    }
  }

  componentDidMount() {
    this.createPagination();
  }
  componentDidUpdate(prevProps, prevState) {
    let context = this;
    if (prevProps.total_pages!==this.props.total_pages) {
        context.createPagination();
    }
    else if (prevProps.current_page!==this.props.current_page) {
        context.createPagination();
    }
    else if (prevProps.paginate!==this.props.paginate) {
        context.createPagination();
    }
  }

  render() {
    return (
      <div className="pagination-container">
        <ul className="pagination pagination-sm">
          {this.state.paginationItems}
        </ul>
      </div>
    )
  }

}
