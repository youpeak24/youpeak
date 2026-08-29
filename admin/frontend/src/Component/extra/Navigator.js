import  Tooltip  from "@mui/material/Tooltip";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navigator = (props) => {
  const location = useLocation();

  const { name, path, path2 , navIcon, onClick, navIconImg, navSVG,liClass } = props;


  return (
    <ul className="mainMenu">
      <li onClick={onClick} className={liClass}>
        <Tooltip title={name} placement="right">
          <Link
            to={{ pathname: path }}
            className={`${location.pathname === path ? location.pathname === path && "activeMenu" : location.pathname === path2 && "activeMenu"}`}
          >
            <div>
               {/* {navIconImg ? (
                <>
                  <img src={navIconImg} />
                </>
              ) : navIcon ? (
                <>
                  <i className={navIcon}></i>
                </>
              ) : (
                <>{navSVG}</>
              )} */}
              {navIcon}
              {/* <IconUser/> */}
              <span className="text-capitalize">{name}</span>
            </div>
            {props?.children && <i className="fa-solid fa-angle-right"></i>}
          </Link>
        </Tooltip>
        {/* If Submenu */}
        <ul className={`subMenu transform0`}>
          {props.children?.map((res) => {
            const { subName, subPath, onClick } = res?.props;
            return (
              <>
                <Tooltip title={subName} placement="right">
                  <li>
                    <Link
                      to={{ pathname: subPath }}
                      className={`${
                        location.pathname === subPath && "activeMenu"
                      }`}
                      onClick={onClick}
                    >
                      <i className="fa-solid fa-circle"></i>
                      <span style={{ fontSize: "14px" }}>{subName}</span>
                    </Link>
                  </li>
                </Tooltip>
              </>
            );
          })}
        </ul>
      </li>
    </ul>
  );
};


export default Navigator;
