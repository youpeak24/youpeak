import { Link } from "react-router-dom";
import DayAnalytics from "./DayAnalytics";
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { ReactComponent as DownArrowIcon } from "../../assets/icons/downArrowIcon.svg";
import DateRangePicker from "react-bootstrap-daterangepicker";
import MultiButton from "./MultiButton";

const Title = (props) => {
  const {
    newClass,
    name,
    dayAnalyticsShow,
    titleShow,
    setStartDate,
    setEndDate,
    endDate,
    startDate,
    setMultiButtonSelect,
    multiButtonSelect,
    labelData,
  } = props;

  const [dayAnalytics, setDayAnalytics] = useState("all");

  const handleChange = (event) => {
    const selectedValue = event.target.value;
    setDayAnalytics(selectedValue);

    const currentDate = new Date();

    switch (selectedValue) {
      case "all":
        setStartDate("All");
        setEndDate("All");
        break;
      case "today":
        setStartDate(currentDate);
        setEndDate(currentDate);
        break;
      case "yesterday":
        const yesterdayDate = dayjs(currentDate).subtract(1, "day");
        setStartDate(yesterdayDate.isValid() ? yesterdayDate.toDate() : null);
        setEndDate(yesterdayDate.isValid() ? yesterdayDate.toDate() : null);
        break;
      case "week":
        const weekStartDate = dayjs(currentDate).startOf("week");
        const weekEndDate = dayjs(currentDate).endOf("week");
        setStartDate(weekStartDate.isValid() ? weekStartDate.toDate() : null);
        setEndDate(weekEndDate.isValid() ? weekEndDate.toDate() : null);
        break;
      case "month":
        const firstDayOfMonth = dayjs(currentDate).startOf("month");
        const lastDayOfMonth = dayjs(currentDate).endOf("month");
        setStartDate(
          firstDayOfMonth.isValid() ? firstDayOfMonth.toDate() : null
        );
        setEndDate(lastDayOfMonth.isValid() ? lastDayOfMonth.toDate() : null);
        break;
      case "year":
        const yearStartDate = dayjs(currentDate).startOf("year");
        const yearEndDate = dayjs(currentDate).endOf("year");
        setStartDate(yearStartDate.isValid() ? yearStartDate.toDate() : null);
        setEndDate(yearEndDate.isValid() ? yearEndDate.toDate() : null);
        break;
      default:
        setStartDate(null);
        setEndDate(null);
    }
  };

  const handleApply = (event, picker) => {
    const start = dayjs(picker.startDate).format("YYYY-MM-DD");
    const end = dayjs(picker.endDate).format("YYYY-MM-DD");
    setStartDate(start);
    setEndDate(end);
  };
  const [isDateRangePickerVisible, setDateRangePickerVisible] = useState(false);

  const [state, setState] = useState({
    start: dayjs().subtract(29, "days"),
    end: dayjs(),
  });
  const { start, end } = state;

  const handleCancel = (event, picker) => {
    picker?.element.val("");
    setStartDate("");
    setEndDate("");
  };

  const handleCallback = (start, end) => {
    setState({ start, end });
  };
  const label = start.format("DD/MM/YYYY") + " - " + end.format("DD/MM/YYYY");

  const { color, bgColor } = props;

  const startAllDate = "1970-01-01";
  const endAllDate = dayjs().format("YYYY-MM-DD");

  $(document).ready(function () {
    $("data-range-key").removeClass("active");
    $("[data-range-key='All']").addClass("active");
  });

  const handleInputClick = () => {
    setDateRangePickerVisible(!isDateRangePickerVisible);
  };

  return (
    <>
      <div>
        <div className="row align-items-center">
          <div
            className={` ${dayAnalyticsShow
              ? `col-12 col-sm-12 col-md-6 ${titleShow ? "col-lg-6" : "col-lg-8"
              }`
              : "col-12"
              }`}
          >
            {/* <h4 className="heading-dashboard d-block">Welcome Admin !</h4> */}

            {titleShow && (
              <div className={!newClass ? `boxBetween ` : `${newClass}`}>
                <div className="title">
                  <h4
                    className="mb-0  text-capitalize text-nowrap"
                    style={{ fontSize: "20px", fontWeight: "500" }}
                  >
                    {name}
                  </h4>
                </div>

              </div>
            )}
            <div className="multi-user-btn ">
              <MultiButton
                multiButtonSelect={multiButtonSelect ? multiButtonSelect : ""}
                setMultiButtonSelect={
                  setMultiButtonSelect ? setMultiButtonSelect : ""
                }
                label={labelData ? labelData : []}
              />
            </div>
          </div>
          {dayAnalyticsShow ? (
            <div
              className={`col-12 col-sm-12 col-md-6 col-lg-4 pl-0 ${titleShow ? "col-lg-6" : "col-lg-4"
                }`}
              style={{ paddingRight: "10px", paddingLeft: "0px" }}
            >
              <div className="dayAnalytics">

                <div className="date-range-box">
                  <DateRangePicker
                    initialSettings={{
                      startDate: undefined,
                      endDate: undefined,
                      ranges: {
                        All: [new Date("1970-01-01"), dayjs().toDate()],
                        Today: [dayjs().toDate(), dayjs().toDate()],
                        Yesterday: [
                          dayjs().subtract(1, "days").toDate(),
                          dayjs().subtract(1, "days").toDate(),
                        ],

                        "Last 7 Days": [
                          dayjs().subtract(6, "days").toDate(),
                          dayjs().toDate(),
                        ],
                        "Last 30 Days": [
                          dayjs().subtract(29, "days").toDate(),
                          dayjs().toDate(),
                        ],
                        "This Month": [
                          dayjs().startOf("month").toDate(),
                          dayjs().endOf("month").toDate(),
                        ],
                        "Last Month": [
                          dayjs()
                            .subtract(1, "month")
                            .startOf("month")
                            .toDate(),
                          dayjs().subtract(1, "month").endOf("month").toDate(),
                        ],

                      },
                      maxDate: new Date(),
                    }}
                    onCallback={handleCallback}
                    onApply={handleApply}
                  >
                    <input
                      type="text"
                      bgColor={bgColor}
                      color={color}
                      readOnly
                      placeholder="Select Date Range"
                      onClick={handleInputClick}
                      className={`daterange date-range-style float-right  mr-4  text-center ${bgColor} ${color}`}
                      value={
                        (startDate === startAllDate &&
                          endDate === endAllDate) ||
                          (startDate === "All" && endDate === "All")
                          ? "Select Date Range"
                          : dayjs(startDate).format("MM/DD/YYYY") &&
                            dayjs(endDate).format("MM/DD/YYYY")
                            ? `${dayjs(startDate).format("MM/DD/YYYY")} - ${dayjs(
                              endDate
                            ).format("MM/DD/YYYY")}`
                            : "Select Date Range"
                      }
                      style={{
                        fontWeight: 500,
                        cursor: "pointer",
                        background: "#1C1538",
                        color: "#F0EEFF",
                        border: "1px solid rgba(124, 92, 252, 0.25)",
                        display: "flex",
                        width: "100%",
                        justifyContent: "end",
                        fontSize: "14px",
                        padding: "8px 18px",
                        maxWidth: "250px",
                        borderRadius: "8px",
                      }}
                    />
                  </DateRangePicker>
                  {/* <div className="right-drp-btn">Analytics</div> */}
                </div>
              </div>
            </div>
          ) : (
            ""
          )}

        </div>
      </div>
    </>
  );
};

export default Title;
