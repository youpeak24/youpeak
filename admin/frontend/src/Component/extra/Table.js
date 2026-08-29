import React, { useState, useEffect } from "react";
import { Skeleton } from "@mui/material";

function Table(props) {
  const {
    data,
    checkBoxShow,
    mapData,
    PerPage,
    Page,
    type,
    style,
    onChildValue,
    selectAllChecked,
    handleSelectAll,
    loading
  } = props;

  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [checkBox, setCheckBox] = useState();




  const sortedData =
    data?.length > 0 &&
    [...data].sort((a, b) => {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];

      if (valueA < valueB) {
        return sortOrder === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    });

  // Slice the data if it's defined
  const startIndex = (Page - 1) * PerPage;
  const endIndex = startIndex + PerPage;
  const currentPageData = data && data?.slice(startIndex, endIndex);

  return (
    <>
      <div className="primeMain table-custom">
        <table
          width="100%"
          className="primeTable text-center"
          style={{ ...style }}
        >
          <thead
            className=""
            style={{ zIndex: "2", position: "sticky", top: "0" }}
          >
            <tr>
              {mapData?.map((res) => {
                return (
                  <th className="text-nowrap" key={res.Header}>
                    <div className="table-head">
                      {res?.Header === "checkBox" ? (
                        <input
                          type="checkbox"
                          checked={selectAllChecked}
                          onChange={handleSelectAll}
                        />
                      ) : (
                        `${" "}${res?.Header}`
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {loading ? (
            <tbody>
              {[1, 2, 3, 4, 5].map((_, index) => (
                <tr key={index}>
                  {mapData.map((res, i) => (
                    <td key={i}>
                      <Skeleton variant="rectangular" height={30} style={{ borderRadius: '4px', margin: '10px' }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ) : (
            <>
              {type == "server" && (
                <>
                  <tbody>
                    {sortedData?.length > 0 ? (
                      <>
                        {sortedData.map((i, k) => {
                          return (
                            <React.Fragment key={i?._id || `server-row-${k}`}>
                              <tr>
                                {mapData.map((res) => {
                                  return (
                                    <td key={`${res?.Header || res?.body || "col"}-${k}`}>
                                      {res.Cell ? (
                                        <res.Cell row={i} index={k} />
                                      ) : (
                                        <span className={res.class}>
                                          {i[res.body] || "-"}
                                        </span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            </React.Fragment>
                          );
                        })}
                      </>
                    ) : (
                      <tr>
                        <td
                          colSpan="25"
                          className="text-center"
                          style={{ borderBottom: "none", padding: '20px' }}
                        >
                          No Data Found !
                        </td>
                      </tr>
                    )}
                  </tbody>
                </>
              )}

              {type == "client" && (
                <>
                  <tbody>
                    {currentPageData?.length > 0 ? (
                      <>
                        {currentPageData?.map((i, k) => {
                          return (
                            <React.Fragment key={i?._id || `client-row-${k}`}>
                              <tr>
                                {mapData.map((res) => {
                                  return (
                                    <td key={`${res?.Header || res?.body || "col"}-${k}`}>
                                      {res.Cell ? (
                                        <res.Cell row={i} index={k} />
                                      ) : (
                                        <span className={res.class}>
                                          {i[res.body]}
                                        </span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            </React.Fragment>
                          );
                        })}
                      </>
                    ) : (
                      <tr>
                        <td
                          colSpan="16"
                          className="text-center"
                          style={{ borderBottom: "none", padding: "20px" }}
                        >
                          No Data Found !
                        </td>
                      </tr>
                    )}
                  </tbody>
                </>
              )}
            </>
          )}
        </table>
      </div>
    </>
  );
}

export default Table;
