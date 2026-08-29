import React from "react";
import { Link } from "react-router-dom";

const DashboardBox = (props) => {
  const { title, icon, value, link ,iconImg} = props;

  return (
    <>
      <div className="col-3 mb-4">
        <div className="dashboardBox">
          <div className="boxBetween">
            <div className="dashIcon">
              {icon ? (
                <>
                  <i className={icon}></i>
                </>
              ) : (
                <>
                  <img src={iconImg}/>
                </>
              )}
            </div>
            <div className="dashCount fw-bold text-end">
              <div className="dName">{title}</div>
              <div className="dCount">{value}</div>
            </div>
          </div>
          <div className="border-bottom border-dark mt-2"></div>
          <Link to={link}>
            <div className="showMoreBtn fw-bold">
              <span className="me-2">show more</span>
              <span>
                <i className="fa-solid fa-arrow-right-long"></i>
              </span>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};

export default DashboardBox;
