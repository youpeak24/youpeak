import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserImage from "../../assets/images/defaultUserImage.avif";
import Logo from "../../assets/images/logo.svg";
import { useDispatch, useSelector } from "react-redux";

import { getDefaultCurrency } from "../store/currency/currency.action";
import { projectName } from "../../util/config";
import { IconMenuDeep } from "@tabler/icons-react";
import { IconLogout, IconSettings, IconUserSquareRounded } from "@tabler/icons-react";
import { warning } from "../../util/Alert";
import { LOGOUT_ADMIN } from "../store/admin/admin.type";

const Navbar = (props) => {
  const { admin } = useSelector((state) => state.admin);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // setTimeout(()=>{
    dispatch(getDefaultCurrency());
    // },1000)
  }, [dispatch]);

  const adminName = useMemo(() => admin?.name || "Admin", [admin?.name]);
  const adminEmail = useMemo(() => admin?.email || "", [admin?.email]);

  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    const data = warning(null, "Are you sure you want to logout?");
    data
      .then((logout) => {
        if (logout?.isConfirmed) {
          dispatch({ type: LOGOUT_ADMIN });
          navigate("/");
          window.location.reload();
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <>
      <div className="mainNavbar webNav me-4">
        <div className="row">
          <div className="navBox ">
            <div style={{ padding: "0px 20px" }}>
              <div
                className="navBar boxBetween"
                style={{ padding: "10px 15px" }}
              >
                <div className="navToggle" id={"toggle"}>
                  <IconMenuDeep className="text-secondary" />
                </div>
                <div className="col-7 logo-show-nav">
                  <div className="d-flex align-items-center">
                    <Link
                      to={"/admin/mainDashboard"}
                      className="d-flex align-items-center gap-2"
                      style={{marginLeft: "5px"}}
                    >
                      <img src={Logo} alt="" width={"40px"} />
                      <span className="fs-3 fw-bold text-black">
                        {projectName}
                      </span>
                    </Link>
                  </div>
                </div>
                <div className="col-4">
                  <div className="navIcons d-flex align-items-center justify-content-end">
                    <div
                      className="pe-4 cursor"
                      style={{ backgroundColor: "inherit", position: "relative" }}
                    ></div>
                    <div className="navbar-profile-dropdown" ref={dropdownRef}>
                      <button
                        type="button"
                        className="navbar-profile-trigger"
                        onClick={() => setIsOpen((v) => !v)}
                        aria-haspopup="menu"
                        aria-expanded={isOpen}
                      >
                        <div className="navbar-profile-meta">
                          <span className="navbar-profile-name">{adminName}</span>
                        </div>
                        <img
                          src={admin?.image}
                          alt="admin"
                          width="40px"
                          height="40px"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = UserImage;
                          }}
                          className="navbar-profile-avatar"
                        />
                      </button>

                      {isOpen && (
                        <div className="navbar-profile-menu" role="menu">
                          <div className="navbar-profile-header">
                            <div className="navbar-profile-header-name">{adminName}</div>
                            {!!adminEmail && (
                              <div className="navbar-profile-header-email">
                                {adminEmail}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            className="navbar-profile-item"
                            role="menuitem"
                            onClick={() => {
                              setIsOpen(false);
                              navigate("/admin/profile");
                            }}
                          >
                            <IconUserSquareRounded size={18} />
                            <span>My Profile</span>
                          </button>

                          <button
                            type="button"
                            className="navbar-profile-item"
                            role="menuitem"
                            onClick={() => {
                              setIsOpen(false);
                              navigate("/admin/settingPage");
                            }}
                          >
                            <IconSettings size={18} />
                            <span>Setting</span>
                          </button>

                          <div className="navbar-profile-divider" />

                          <button
                            type="button"
                            className="navbar-profile-logout"
                            role="menuitem"
                            onClick={handleLogout}
                          >
                            <span className="navbar-profile-logout-text">Logout</span>
                            <IconLogout size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
