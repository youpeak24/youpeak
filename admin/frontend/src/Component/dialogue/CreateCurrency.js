import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  createCurrency,
  updateCurrency,
} from "../store/currency/currency.action";
import { CLOSE_DIALOGUE } from "../store/dialogue/dialogue.type";
import { Box, Modal, Typography } from "@mui/material";

import Input from "../extra/Input";
import Button from "../extra/Button";


const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  borderRadius: "13px",
  border: "1px solid #C9C9C9",
  boxShadow: 24,
  p: "19px",
};

const ListItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const CreateCurrency = (props) => {
  const { dialogue, dialogueType, dialogueData } = useSelector(
    (state) => state.dialogue
  );

  const [contactUsDialogue, setContactUsDialogue] = useState(false);
  const [name, setName] = useState();
  const [symbol, setSymbol] = useState();
  const [currencyCode, setCurrencyCode] = useState();
  const [countryCode, setCountryCode] = useState();

  const [error, setError] = useState({
    name: "",
    symbol: "",
    currencyCode: "",
    countryCode: "",
  });

  const dispatch = useDispatch();
  useEffect(() => {
    setContactUsDialogue(dialogue);
    setName(dialogueData?.name);
    setSymbol(dialogueData?.symbol);
    setCurrencyCode(dialogueData?.currencyCode);
    setCountryCode(dialogueData?.countryCode);
  }, [dialogue, dialogueData]);

  const handleCloseAddCategory = () => {
    setContactUsDialogue(false);
    dispatch({
      type: CLOSE_DIALOGUE,
      payload: {
        dialogue: false,
      },
    });

    let dialogueData_ = {
      dialogue: false,
    };
    sessionStorage.setItem("dialogueData", JSON.stringify(dialogueData_));
  };

  const handleSubmit = () => {

    if (!name || !symbol || !currencyCode || !countryCode) {
      let error = {};
      if (!name) error.name = "Name Is Required !";

      if (!symbol) error.symbol = "Symbol Is Required !";
      if (!currencyCode) error.currencyCode = "CurrencyCode is required !";
      if (!countryCode) error.countryCode = "CountryCode is required !";

      return setError({ ...error });
    } else {
      const addContactUs = {
        name: name,
        symbol: symbol,
        currencyCode: currencyCode,
        countryCode: countryCode,
      };
      if (dialogueData) {
        props.updateCurrency(addContactUs, dialogueData?._id);
      } else {
        props.createCurrency(addContactUs);
      }
      handleCloseAddCategory();
    }
  };
  return (
    <div>
      <Modal
        open={contactUsDialogue}
        onClose={handleCloseAddCategory}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="model-style">
          <div className="model-header">
            <p className="m-0">
              {dialogueData ? "Update Currency " : "Add Currency "}
            </p>
          </div>
          <div className="model-body">
            <form>
              <Input
                label={"Name"}
                name={"name"}
                placeholder={"Enter Name"}
                value={name}
                errorMessage={error.name && error.name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      name: `Name Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      name: "",
                    });
                  }
                }}
              />
              <Input
                label={"Symbol"}
                name={"symbol"}
                placeholder={"Enter Symbol"}
                value={symbol}
                newClass={`mt-3`}
                errorMessage={error.symbol && error.symbol}
                onChange={(e) => {
                  setSymbol(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      symbol: `symbol Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      symbol: "",
                    });
                  }
                }}
              />
              <Input
                label={"Currency Code"}
                name={"currencyCode"}
                placeholder={"Enter CurrencyCode"}
                value={currencyCode}
                newClass={`mt-3`}
                errorMessage={error.currencyCode && error.currencyCode}
                onChange={(e) => {
                  setCurrencyCode(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      currencyCode: `CurrencyCode is required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      currencyCode: "",
                    });
                  }
                }}
              />
              <Input
                label={"Country Code"}
                name={"countryCode"}
                placeholder={"Enter countryCode"}
                value={countryCode}
                newClass={`mt-3`}
                errorMessage={error.countryCode && error.countryCode}
                onChange={(e) => {
                  setCountryCode(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      countryCode: `CountryCode is required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      countryCode: "",
                    });
                  }
                }}
              />


            </form>
          </div>
          <div className="model-footer">
            <div className="m-3 d-flex justify-content-end">
              <Button
                onClick={handleCloseAddCategory}
                btnName={"Close"}
                newClass={"close-model-btn me-2"}
              />
              <Button
                onClick={handleSubmit}
                btnName={"Submit"}
                type={"button"}
                newClass={"submit-btn"}

              />
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};
export default connect(null, { createCurrency, updateCurrency })(
  CreateCurrency
);
