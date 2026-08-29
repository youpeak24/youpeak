import { Box, Modal } from "@mui/material";
import React, { useEffect, useState, useRef } from "react";
import Input from "../extra/Input";
import Button from "../extra/Button";
import { connect, useDispatch, useSelector } from "react-redux";
import { CLOSE_DIALOGUE } from "../store/dialogue/dialogue.type";

import { setToast } from "../../util/toast";
import { uploadFile } from "../../util/AwsFunction";
import { addLanguage, updateLanguage } from "../store/language/language.action";
import { IconUpload } from "@tabler/icons-react";

function LanguageDialog(props) {
  const { dialogue, dialogueType, dialogueData } = useSelector((state) => state.dialogue);
  const [open, setOpen] = useState(false);
  const [languageTitle, setLanguageTitle] = useState("");
  const [languageCode, setLanguageCode] = useState("");
  const [localLanguageTitle, setLocalLanguageTitle] = useState("");
  const [languageIcon, setLanguageIcon] = useState(null);
  const [previewIcon, setPreviewIcon] = useState("");

  const [initialData, setInitialData] = useState(null);
  const [error, setError] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    if (dialogueType === "languageAdd" || dialogueType === "languageEdit") {
      setOpen(dialogue);
    } else {
      setOpen(false);
    }

    if (dialogueData && dialogueType === "languageEdit") {
      setLanguageTitle(dialogueData.languageTitle || "");
      setLanguageCode(dialogueData.languageCode || "");
      setLocalLanguageTitle(dialogueData.localLanguageTitle || "");
      setPreviewIcon(dialogueData.languageIcon || "");
      setLanguageIcon(null);
      setInitialData({
        languageTitle: dialogueData.languageTitle,
        languageCode: dialogueData.languageCode,
        localLanguageTitle: dialogueData.localLanguageTitle,
        languageIcon: dialogueData.languageIcon,
      });
    } else {
      setLanguageTitle("");
      setLanguageCode("");
      setLocalLanguageTitle("");
      setLanguageIcon(null);
      setPreviewIcon("");
      setInitialData(null);
    }
  }, [dialogue, dialogueData, dialogueType]);

  const handleClose = () => {
    setOpen(false);
    dispatch({ type: CLOSE_DIALOGUE, payload: { dialogue: false } });
    sessionStorage.setItem("dialogueData", JSON.stringify({ dialogue: false }));
  };

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  useEffect(() => {
    if (dialogueData && dialogueType === "languageEdit" && initialData) {
      if (
        languageTitle !== initialData.languageTitle ||
        languageCode !== initialData.languageCode ||
        localLanguageTitle !== initialData.localLanguageTitle ||
        languageIcon !== null
      ) {
        setIsSubmitDisabled(false);
      } else {
        setIsSubmitDisabled(true);
      }
    } else {
      setIsSubmitDisabled(false);
    }
  }, [languageTitle, languageCode, localLanguageTitle, languageIcon, initialData, dialogueData, dialogueType]);




  const handleSubmit = async () => {


    let err = {};
    if (!languageTitle) err.title = "Language Title is required";
    if (!languageCode) err.code = "Language Code is required";
    if (!localLanguageTitle) err.localTitle = "Localized Title is required";
    if (!languageIcon && !previewIcon) err.icon = "Language Icon is required";

    if (Object.keys(err).length > 0) return setError(err);

    // Call API depending on Edit/Add
    try {
      let iconUrl = previewIcon;

      if (languageIcon) {
        const result = await uploadFile(languageIcon, "language", dispatch, "language-icon");
        iconUrl = result.resDataUrl;
      }

      const payload = {
        languageTitle,
        languageCode,
        localLanguageTitle,
        languageIcon: iconUrl,
      };

      if (dialogueData && dialogueType === "languageEdit") {
        const updatePayload = { languageCode: initialData.languageCode };
        if (payload.languageTitle !== initialData.languageTitle) updatePayload.languageTitle = payload.languageTitle;
        if (payload.localLanguageTitle !== initialData.localLanguageTitle) updatePayload.localLanguageTitle = payload.localLanguageTitle;
        if (payload.languageIcon !== initialData.languageIcon) updatePayload.languageIcon = payload.languageIcon;

        props.updateLanguage(updatePayload);
      } else {
        props.addLanguage(payload);
      }
      handleClose();
    } catch (e) {
      console.error(e);
      setToast("error", "Failed to upload image or submit data.");
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLanguageIcon(file);
      setPreviewIcon(URL.createObjectURL(file));
      setError({ ...error, icon: "" });
    }
  };

  if (dialogueType !== "languageAdd" && dialogueType !== "languageEdit") return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box className="model-style">
        <div className="model-header">
          <p className="m-0">{dialogueType === "languageEdit" ? "Edit Language" : "Add Language"}</p>
        </div>
        <div className="model-body">
          <form>
            <Input
              label="Language Title"
              name="title"
              placeholder="e.g. English"
              value={languageTitle}
              errorMessage={error.title}
              onChange={(e) => {
                setLanguageTitle(e.target.value);
                setError({ ...error, title: e.target.value ? "" : "Language Title is required" });
              }}
            />
            <Input
              label="Language Code"
              name="code"
              placeholder="e.g. en"
              value={languageCode}
              disabled={dialogueType === "languageEdit"}
              errorMessage={error.code}
              onChange={(e) => {
                setLanguageCode(e.target.value);
                setError({ ...error, code: e.target.value ? "" : "Language Code is required" });
              }}
            />
            <Input
              label="Localized Title"
              name="localTitle"
              placeholder="e.g. English"
              value={localLanguageTitle}
              errorMessage={error.localTitle}
              onChange={(e) => {
                setLocalLanguageTitle(e.target.value);
                setError({ ...error, localTitle: e.target.value ? "" : "Localized Title is required" });
              }}
            />

            <div className="mt-3">
              <Input
                type={"file"}
                label={"Image"}
                accept={"image/*"}
                errorMessage={error.icon && error.icon}
                onChange={handleImageChange}
              />
              <div className="mt-2 fake-create-img mb-2">
                {previewIcon && (
                  <img src={previewIcon} alt="Icon Preview" style={{ width: "96px", height: "auto" }} />
                )}
              </div>
            </div>
          </form>
        </div>
        <div className="model-footer">
          <div className="m-3 d-flex justify-content-end">
            <Button onClick={handleClose} btnName="Close" newClass="close-model-btn me-3" />
            <Button onClick={handleSubmit} btnName="Submit" newClass="submit-btn" disabled={isSubmitDisabled} />
          </div>
        </div>
      </Box>
    </Modal>
  );
}

export default connect(null, { addLanguage, updateLanguage })(LanguageDialog);
