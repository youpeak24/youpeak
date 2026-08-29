import React, { useEffect, useState } from "react";
//material-ui
import TablePagination from "react-js-pagination";

//useStyle

const Pagination = (props) => {
  const [pages, setPages] = useState([]);

  const {
    customSelectDataShow,
    customSelectData,
    type,
    // server props
    setPage,
    userTotal,
    rowsPerPage,
    activePage,
    actionShow,
    // client props
    size,
    totalData,
    data,
    setData,
    // selector
    setActionPagination,
    actionPagination,
    paginationSubmitButton,
    setActivePage,
  } = props;

  const [clientData, setClientData] = useState();

  const handlePage = (pageNumber) => {
    if (props.handlePageChange) {
      props.handlePageChange(pageNumber);
    } else {
      setPage(pageNumber);
    }
  };

  const totalPages = Math.ceil(userTotal / rowsPerPage);
  const startIndex = userTotal === 0 ? 0 : (activePage - 1) * rowsPerPage + 1;
  const endIndex = userTotal === 0 ? 0 : Math.min(activePage * rowsPerPage, userTotal);

  const renderLimitAndText = () => (
    <div className="pagination-limit-text">
      {props.handleRowsPerPage && (
        <div className="pagination-select">
          <select
            className="form-select form-select-sm"
            value={rowsPerPage}
            onChange={(e) => props.handleRowsPerPage(parseInt(e.target.value))}
            style={{ width: "auto", cursor: "pointer", display: "inline-block" }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      )}
      <p className="pagination-text">
        Showing {startIndex} to {endIndex} out of {userTotal} entries
      </p>
    </div>
  );

  return (
    <>
      {userTotal > 0 && (
        <div className="row gx-0 custom-pagination m-0 w-100 px-3">
          <div className="col-12 pagination-content d-flex flex-column mt-3 mb-3">
            {type === "server" && userTotal > 0 && (
              <div className="pagination-wrapper">
                {renderLimitAndText()}
                <TablePagination
                  activePage={activePage}
                  itemsCountPerPage={rowsPerPage}
                  totalItemsCount={userTotal}
                  pageRangeDisplayed={3}
                  onChange={(page) => handlePage(page)}
                  itemClass="page-item"
                  linkClass="page-link"
                  firstPageText="|<"
                  prevPageText="<"
                  nextPageText=">"
                  lastPageText=">|"
                />
              </div>
            )}
            <div className="w-100">
              {type === "client" && userTotal > 0 && (
                <div className="pagination-wrapper">
                  {renderLimitAndText()}
                  <TablePagination
                    activePage={activePage}
                    itemsCountPerPage={rowsPerPage}
                    totalItemsCount={userTotal}
                    pageRangeDisplayed={3}
                    onChange={handlePage}
                    itemClass="page-item"
                    linkClass="page-link"
                    firstPageText="|<"
                    prevPageText="<"
                    nextPageText=">"
                    lastPageText=">|"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Pagination;