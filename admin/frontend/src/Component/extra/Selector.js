import React, { useEffect, useState } from "react";
import { Skeleton } from "@mui/material";



export default function Selector(props) {
  const {
    label,
    placeholder,
    selectValue,
    setSelectValue,
    paginationOption,
    id,
    labelShow,
    selectData,
    onChange,
    defaultValue,
    errorMessage,
    selectId,
    disabled,
    loading
  } = props;

  return loading ? (
    <div className="selector-custom">
      {labelShow !== false && <Skeleton variant="text" width="60%" height={20} className="mb-2" />}
      <Skeleton variant="rectangular" width="100%" height={45} style={{ borderRadius: "8px" }} />
    </div>
  ) : (
    <div className="selector-custom">
      {labelShow === false ? (
        " "
      ) : (
        <label htmlFor={id} className="label-selector-custom">
          {label}
        </label>
      )}

      <div sx={{ minWidth: 120 }} class="form-group">
        <div className="form-outline" fullWidth>
         
          <select
            id="formControlLg"
            className=" form-select py-2 text-capitalize"
            value={selectValue ? selectValue : ""}
            label={label}
            placeholder={placeholder}
            defaultValue={defaultValue ? defaultValue :""}
            MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }}
            onChange={onChange}
            style={{borderRadius : "5px"}}
            disabled={disabled}
          >
              {
                paginationOption === false ?""
            : 
            <option value="" disabled hidden>
            {placeholder}
          </option>
              }
            {selectData?.map((item, index) => {
              const displayValue = selectId ? item.fullName || item?.name: typeof item === "string" ? item.toLowerCase() : item;
              return (
                <option
                  value={selectId ? item._id : (typeof item === "string" ? item.toLowerCase() : item)}
                  key={index}
                  className="py-2"
                >
                  {displayValue}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      {errorMessage && (
        <p className="errorMessage">{errorMessage && errorMessage}</p>
      )}
    </div>
  );
}
