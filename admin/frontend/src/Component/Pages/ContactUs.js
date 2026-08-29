import React, { useEffect, useState } from "react";
import NewTitle from "../extra/Title";
import { ReactComponent as TrashIcon } from "../../assets/icons/trashIcon.svg";
import Button from "../extra/Button";
import { ReactComponent as EditIcon } from "../../assets/icons/EditBtn.svg";
import AddIcon from "@mui/icons-material/Add";
import { connect, useDispatch, useSelector } from "react-redux";
import Pagination from "../extra/Pagination";
import {
  getContactUsData,
  deleteContactUs,
} from "../store/contactUs/contactUs.action";
import noImageFound from "../../assets/images/noimage.png";
import $ from "jquery";
import Table from "../extra/Table";
import dayjs from "dayjs";
import CreateContactUs from "../dialogue/CreateContactUs";
import { OPEN_DIALOGUE } from "../store/dialogue/dialogue.type";
import { warning } from "../../util/Alert";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import LazyImage from "../../common/ImageFallback";
import { Skeleton } from "@mui/material";

function ContactUsPage(props) {
  const { contactUsData } = useSelector((state) => state.contactUs);

  const { dialogue, dialogueType, dialogueData, isLoading } = useSelector(
    (state) => state.dialogue
  );
  const dispatch = useDispatch();
  const [data, setData] = useState();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [showImg, setShowImg] = useState();

  $(document).ready(function () {
    $("img").bind("error", function () {
      // Set the default image
      $(this).attr("src", noImageFound);
    });
  });

  useEffect(() => {
    setData(contactUsData);
  }, [contactUsData]);

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
            props.deleteContactUs(id);
          }
        }
      })
  };

  const contactUsTable = [
    {
      Header: "NO",
      body: "name",
      Cell: ({ index }) => <span>{(page - 1) * size + index + 1}</span>,
    },
    {
      Header: "IMAGE",
      body: "image",
      Cell: ({ row }) => (
        // <img
        //   src={row?.image}
        //   width="96px"
        //   height="50px"
        //   style={{ objectFit: "contain" }}
        //   onError={(e) => {
        //     e.target.onerror = null;
        //     e.target.src = noImageFound;
        //   }}
        // />
        <div className="d-flex justify-content-center">
          <LazyImage imageSrc={row?.image} width="50px" height="50px" />
        </div>
      ),
    },
    {
      Header: "NAME",
      body: "name",
      Cell: ({ row }) => <span className="text-capitalize">{row?.name}</span>,
    },
    {
      Header: "LINK",
      body: "link",
      Cell: ({ row }) => <span>{row?.link}</span>,
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
            onClick={() => handleEdit(row, "contactUs")}
          />
          <Button
            btnIcon={<TrashIcon />}
            onClick={() => handleDeleteContactUs(row)}
          /> */}

          <button className="btn btn-sm" onClick={() => handleEdit(row, "contactUs")}>
            <IconEdit className="text-secondary" size={20} />
          </button>
          <button className="btn btn-sm" onClick={() => handleDeleteContactUs(row)}>
            <IconTrash className="text-secondary" size={20} />
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    dispatch(getContactUsData());
  }, [dispatch]);


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

  return (
    <div className="  userPage">
      {dialogueType == "contactUs" && <CreateContactUs />}
      {/* <div className="dashboardHeader primeHeader mb-3 p-0">
        <NewTitle
          dayAnalyticsShow={false}
          titleShow={true}
          name={`Contact Us`}
        />
      </div> */}
      <div className="user-table">
        <div className="user-table-top">
          <section className="d-flex justify-content-between align-items-center w-100">
            <div className="col-6">
              <h5
                style={{
                  fontWeight: "500",
                  fontSize: "20px",
                }}
                className="m-0"
              >
                Contact Us
              </h5>
            </div>

            <div className="col-6 d-flex justify-content-end">
              <Button
                btnIcon={<IconPlus width={18} height={18} />}
                newClass={""}
                btnName={"New"}
                onClick={() => handleOpenNew("contactUs")}
              />
            </div>
          </section>
        </div>
        <div className="">
          <Table
            data={isLoading ? Array(10).fill({}) : data}
            mapData={contactUsTable.map((col) => ({
              ...col,
              Cell: (props) => {
                if (isLoading) {
                  if (col.Header === "NO") {
                    return <Skeleton variant="text" width="20px" />;
                  } else if (col.Header === "IMAGE") {
                    return (
                      <div className="d-flex justify-content-center">
                        <Skeleton variant="square" borderRadius={10} width={50} height={50} />
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
        </div>
      </div>
    </div>
  );
}
export default connect(null, {
  getContactUsData,
  deleteContactUs,
})(ContactUsPage);
