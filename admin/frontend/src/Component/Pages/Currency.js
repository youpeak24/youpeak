import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import Table from "../extra/Table";
import Pagination from "../extra/Pagination";
import { ReactComponent as TrashIcon } from "../../assets/icons/trashIcon.svg";
import { ReactComponent as EditIcon } from "../../assets/icons/EditBtn.svg";
import $ from "jquery";
import { OPEN_DIALOGUE } from "../store/dialogue/dialogue.type";
import { warning } from "../../util/Alert";
import { setToast } from "../../util/toast";
import NewTitle from "../extra/Title";
import Button from "../extra/Button";
import AddIcon from "@mui/icons-material/Add";
import {
  getCurrency,
  deleteCurrency,
  isDefaultCurrency,
} from "../store/currency/currency.action";
import dayjs from "dayjs";
import CreateCurrency from "../dialogue/CreateCurrency";
import ToggleSwitch from "../extra/ToggleSwitch";
import { IconEdit, IconPlug, IconPlus, IconTrash } from "@tabler/icons-react";
import { Skeleton } from "@mui/material";

const Currency = (props) => {
  const { currency } = useSelector((state) => state.currency);

  const { dialogue, dialogueType, dialogueData, isLoading } = useSelector(
    (state) => state.dialogue
  );
  const dispatch = useDispatch();
  const [data, setData] = useState();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  useEffect(() => {
    dispatch(getCurrency());
  }, [dispatch]);

  useEffect(() => {
    setData(currency);
  }, [currency]);

  const handleEdit = (row, type) => {
    dispatch({
      type: OPEN_DIALOGUE,
      payload: {
        type: type,
        data: row,
      },
    });

    let dialogueData_ = {
      dialogue: true,
      type: type,
      dialogueData: row,
    };
    sessionStorage.setItem("dialogueData", JSON.stringify(dialogueData_));
  };

  const handleDeleteContactUs = (row) => {

    const data = warning();
    data
      .then((res) => {
        if (res) {
          const yes = res.isConfirmed;
          if (yes) {
            const id = row?._id;
            props.deleteCurrency(id);
          }
        }
      })
  };

  const contactUsTable = [
    {
      Header: "NO",
      body: "name",
      Cell: ({ index }) => <span>{index + 1}</span>,
    },

    {
      Header: "NAME",
      body: "name",
      Cell: ({ row }) => <span className="text-capitalize">{row?.name}</span>,
    },

    {
      Header: "SYMBOL",
      body: "symbol",
      Cell: ({ row }) => <span className="text-capitalize">{row?.symbol}</span>,
    },
    {
      Header: "CURRENCY CODE",
      body: "currencyCode",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.currencyCode}</span>
      ),
    },
    {
      Header: "COUNTRY CODE",
      body: "countryCode",
      Cell: ({ row }) => (
        <span className="text-capitalize">{row?.countryCode}</span>
      ),
    },
    {
      Header: "IS DEFAULT",
      body: "isActive",
      Cell: ({ row }) => (
        <ToggleSwitch
          value={row?.isDefault}
          onChange={() => handleIsActive(row)}
        />
      ),
    },
    {
      Header: "CREATE DATE",
      body: "createdAt",
      Cell: ({ row }) => (
        <span className="text-capitalize">
          {row?.createdAt ? dayjs(row?.createdAt).format("MM/DD/YYYY hh:mm A") : ""}
        </span>
      ),
    },
    {
      Header: "ACTION",
      body: "action",
      Cell: ({ row }) => (
        <div className="action-button">
          {/* <Button
            btnIcon={<EditIcon />}
            onClick={() => handleEdit(row, "currency")}
          />
          <Button
            btnIcon={<TrashIcon />}
            onClick={() => handleDeleteContactUs(row)}
          /> */}

          <button className="btn btn-sm" onClick={() => handleEdit(row, "currency")}>
            <IconEdit className="text-secondary" size={20} />
          </button>
          <button className="btn btn-sm" onClick={() => handleDeleteContactUs(row)}>
            <IconTrash className="text-secondary" size={20} />
          </button>
        </div>
      ),
    },
  ];

  const handleOpenNew = (type) => {

    dispatch({
      type: OPEN_DIALOGUE,
      payload: {
        type: type,
      },
    });

    let dialogueData_ = {
      dialogue: true,
      type: type,
    };
    sessionStorage.setItem("dialogueData", JSON.stringify(dialogueData_));
  };

  const handleIsActive = (row) => {


    if (row?.isDefault) {
      setToast(
        "info",
        "The default currency cannot be turned off and at least one currency must remain active."
      );
      return;
    }

    props.isDefaultCurrency(row?._id);
  };

  return (
    <div className=" userPage">
      {dialogueType === "currency" && <CreateCurrency />}
      {/* <div className="dashboardHeader primeHeader mb-3 p-0">
        <NewTitle dayAnalyticsShow={false} titleShow={true} name={`Currency`} />
      </div> */}
      <div className="user-table mb-3">
        <div className="user-table-top">
          <section className="d-flex justify-content-between align-items-center w-100">
            <div className="col-6">
              <h5
                style={{
                  fontWeight: "500",
                  fontSize: "20px",
                  marginTop: "5px",
                  marginBottom: "4px",
                }}
              >
                Currency
              </h5>
            </div>
            <div className="col-6 d-flex justify-content-end">
              <Button
                btnIcon={<IconPlus height={18} width={18} />}
                newClass={""}
                btnName={"New"}
                onClick={() => handleOpenNew("currency")}
              />
            </div>
          </section>
        </div>
        {/* <div className="row align-items-center mb-2 p-3 ml-1">
          <div className="col-12 col-sm-6 col-md-6 col-lg-6">
            <h5
              style={{
                fontWeight: "500",
                fontSize: "20px",
                marginBottom: "0px",
                marginTop: "5px",
                padding: "3px",
              }}
            >
              Currency Table
            </h5>
          </div>
          <div className="col-12 col-sm-6 col-md-6 col-lg-6 mt-2 m-sm-0 new-fake-btn d-flex justify-content-end">
            <Button
              btnIcon={<AddIcon />}
              newClass={"rounded"}
              btnName={"New"}
              onClick={() => handleOpenNew("currency")}
            />
          </div>
        </div> */}
        <div className="">
          <Table
            data={isLoading ? Array(10).fill({}) : data}
            mapData={contactUsTable.map((col) => ({
              ...col,
              Cell: (props) => {
                if (isLoading) {
                  if (col.Header === "NO") {
                    return <Skeleton variant="text" width="20px" />;
                  } else if (col.Header === "IS DEFAULT") {
                    return (
                      <div className="d-flex justify-content-center">
                        <Skeleton variant="rectangular" width={40} height={20} style={{ borderRadius: "10px" }} />
                      </div>
                    );
                  } else if (col.Header === "ACTION") {
                    return (
                      <div className="action-button">
                        <Skeleton variant="circular" width={25} height={25} />
                        <Skeleton variant="circular" width={25} height={25} className="ms-2" />
                      </div>
                    );
                  } else {
                    return <Skeleton variant="text" width="80%" height={20} />;
                  }
                }
                return col.Cell ? <col.Cell {...props} /> : props.row[col.body];
              },
            }))}
            PerPage={size}
            Page={page}
            type={"client"}
          />
          <div className="">
            {/* <Pagination
              type={"client"}
              activePage={page}
              rowsPerPage={size}
              userTotal={currency?.length}
              setPage={setPage}
              setData={setData}
              data={data}
              actionShow={false}
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(null, { deleteCurrency, isDefaultCurrency })(Currency);
