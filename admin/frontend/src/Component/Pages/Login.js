import { useEffect, useState } from "react";
import Button from "../extra/Button";
import Input from "../extra/Input";
import Logo from "../../assets/images/logo.svg";
import LoginContain from "../../assets/images/LoginContain.png";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../store/admin/admin.action";
import LoginImg from "../../assets/images/login2.png";
import { connect, useSelector } from "react-redux";
import { projectName } from "../../util/config";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { setToast } from "../../util/toast";

const Login = (props) => {
  let navigate = useNavigate();

  const isAuth = useSelector((state) => state.admin.isAuth);

  // Commented out to prevent navigation race condition
  useEffect(() => {
    isAuth && navigate("/admin");
  }, [isAuth]);

 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  

  const [error, setError] = useState({
    email: "",
    password: "",
  });

  const copyToClipboard = async (text) => {
    const value = String(text ?? "");
    if (!value) return false;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch (err) {
      // Fall back below.
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);
      return successful;
    } catch (err) {
      return false;
    }
  };

  

  const handleSubmit = async () => {
    if (!email || !password) {
      let error = {};
      if (!email) error.email = "Email Is Required !";
      if (!password) error.password = "password is required !";
      return setError({ ...error });
    } else {
      let login = {
        email,
        password,
      };

      setLoading(true)
      props.loginAdmin(login, navigate, () => {
        setLoading(false)
      });
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  };


  return (
    <>

      <div className="d-flex overflow-hidden" style={{ height: "100vh" }}>
        <div className="d-lg-block d-none col-lg-7 col-xl-6 p-0 h-100">
          <img src={LoginImg} alt="Login" className="w-100 h-100" style={{ objectFit: "cover" }} />
        </div>
        <div className="col-12 col-lg-5 col-xl-6 h-100 overflow-auto bg-white">
          <div className="p-4 p-md-5 d-flex align-items-center justify-content-center min-vh-100">
            <div className="w-100 mx-auto" style={{ maxWidth: "440px" }}>
              <div>
                <img
                  src={Logo}
                  alt="Logo"
                  className="mb-2"
                  height={75}
                  width={75}
                />
              </div>
              <h2 className="fw-semibold">Login to your account</h2>
              <p className="text-secondary">
                Let's connect, chat, and spark real connections. Enter your
                credentials to continue your journey on {projectName}.
              </p>
              <Input
                label={`Email`}
                name={"email"}
                id={`loginEmail`}
                placeholder={"Enter Email"}
                type={`email`}
                value={email}
                errorMessage={error.email && error.email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      email: `Email Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      email: "",
                    });
                  }
                }}
                autoComplete="username"
                onKeyPress={handleKeyPress}
              />
              <Input
                label={`Password`}
                name={"password"}
                id={`loginPassword`}
                placeholder={"Enter Password"}
                type={`password`}
                value={password}
                errorMessage={error.password && error.password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      password: `Password Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      password: "",
                    });
                  }
                }}
                autoComplete="current-password"
                onKeyPress={handleKeyPress}
              />

              <div className="w-100" >
                <h4
                  className="cursor-pointer fs-6 text-end text-secondary"
                  style={{ fontWeight: 500, fontSize: "small" }}
                  onClick={() => navigate("/forgotPassword")}
                >
                  Forgot Password ?
                </h4>
              </div>
              <div className="d-flex flex-column justify-content-center w-100 gap-3 mt-4">
                <Button
                  btnName={loading ? "Loading..." : "Login"}
                  newClass={"login-btn  login w-100 py-2 fw-medium"}
                  onClick={handleSubmit}
                  disabled={loading}
                />

              
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default connect(null, { loginAdmin })(Login);
