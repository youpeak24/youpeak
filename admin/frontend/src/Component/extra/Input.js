import { useState } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { Skeleton } from "@mui/material";

const Input = (props) => {
  const {
    label,
    name,
    id,
    type,
    onChange,
    newClass,
    value,
    defaultValue,
    errorMessage,
    placeholder,
    disabled,
    onFocus,
    readOnly,
    onKeyPress,
    checked,
    onClick,
    ref,
    required,
    autoComplete,
    style,
    accept,
    fieldClass,
    labelShow,
    loading
  } = props;

  const [types, setTypes] = useState(type);

  const hideShow = () => {
    types === "password" ? setTypes("text") : setTypes("password");
  };

  return loading ? (
    <div className={`custom-input ${type} ${newClass}`}>
      {labelShow !== false && <Skeleton variant="text" width="60%" height={20} className="mb-2" />}
      <Skeleton variant="rectangular" width="100%" height={45} style={{ borderRadius: "8px" }} />
    </div>
  ) : (
    <>
      <div
        className={`custom-input ${type} ${newClass} ${
          type === "gender" && "me-2 mb-0"
        }`}
      >
        {
          labelShow == false ? " " : 
        <label htmlFor={id}>{label}</label>
        }
        <input
          type={types}
          className={`form-control ${fieldClass}`}
          // id={id}
          onChange={onChange}
          value={value}
          defaultValue={defaultValue}
          name={name}
          onWheel={(e) => type === "number" && e.target.blur()}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          errorMessage={errorMessage}
          onKeyPress={onKeyPress}
          checked={checked}
          onClick={onClick}
          required={required}
          onFocus={onFocus}
          style={style}
          ref={ref}
          accept={accept}
          autoComplete={autoComplete}
        />

        {type !== "search" && (
          errorMessage &&(
            <p className="errorMessage">{errorMessage && errorMessage}</p>
          )
        )}

        {type === "password" && (
          <div className="passHideShow" onClick={hideShow}>
            {types === "password" ? (
              <IconEye size={20} />
            ) : (
              <IconEyeOff size={20} />
            )}
          </div>
        )}
        {type === "search" && !value && (
          <div className="searching">
            <i className="fa-solid fa-magnifying-glass"></i>
          </div>
        )}
      </div>
    </>
  );
};

export default Input;
