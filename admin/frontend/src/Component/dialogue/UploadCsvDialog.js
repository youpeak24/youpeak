import { Box, Modal } from "@mui/material";
import React, { useEffect, useState } from "react";
import Button from "../extra/Button";
import { connect, useDispatch, useSelector } from "react-redux";
import { CLOSE_DIALOGUE } from "../store/dialogue/dialogue.type";

import { setToast } from "../../util/toast";
import Input from "../extra/Input";
import { uploadTranslationCsv } from "../store/translation/translation.action";

function UploadCsvDialog(props) {
  const { dialogue, dialogueType } = useSelector((state) => state.dialogue);
  const { languages } = useSelector((state) => state.language);
  const [open, setOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);

  const dispatch = useDispatch();

  const activeLanguages = languages?.filter((lang) => lang.isActive) || [];

  useEffect(() => {
    if (dialogueType === "uploadLangCsv") {
      setOpen(dialogue);
      setCsvFile(null);
    } else {
      setOpen(false);
    }
  }, [dialogue, dialogueType]);

  const handleClose = () => {
    setOpen(false);
    dispatch({ type: CLOSE_DIALOGUE, payload: { dialogue: false } });
    sessionStorage.setItem("dialogueData", JSON.stringify({ dialogue: false }));
  };



  const handleSubmit = () => {


    if (!csvFile) {
      return setToast("error", "Please select a CSV file first!");
    }

    const formData = new FormData();
    formData.append("file", csvFile);

    props.uploadTranslationCsv(formData, handleClose);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        setToast("error", "Please upload a valid .csv file");
        return;
      }
      setCsvFile(file);
    }
  };

  if (dialogueType !== "uploadLangCsv") return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box className="model-style" sx={{ maxWidth: "550px", width: "100%" }}>
        <div className="model-header">
          <p className="m-0">Upload CSV File</p>
        </div>
        <div className="model-body px-3">
          <p className="text-muted mb-3" style={{ fontSize: "14px", lineHeight: "1.5" }}>
            You currently have <strong>{activeLanguages.length}</strong> active languages. Please upload a CSV file that includes all these languages.
          </p>

          <div className="border mb-3" style={{ maxHeight: "150px", overflowY: "auto" }}>
            {activeLanguages.map((lang, idx) => (
              <div key={lang._id} className={`p-2 px-3 text-muted ${idx !== activeLanguages.length - 1 ? 'border-bottom' : ''}`} style={{ fontSize: "14px" }}>
                {lang.languageTitle} ({lang.languageCode})
              </div>
            ))}
            {activeLanguages.length === 0 && (
              <div className="p-3 text-muted text-center">No active languages found.</div>
            )}
          </div>

          <div className="alert alert-warning mb-3 py-2 px-3 d-flex align-items-center" style={{ fontSize: "14px", border: "1px solid #ffcc00", backgroundColor: "#fffdf0" }}>
            <span className="text-warning me-2 fs-5">⚠️</span>
            <div><strong>Note:</strong> The language code must exist inside the CSV file being uploaded.</div>
          </div>

          <Input
            type={"file"}
            accept={".csv"}
            onChange={handleFileChange}
          />
          {csvFile && <div className="mt-2 text-start text-muted">Selected: {csvFile.name}</div>}
        </div>
        <div className="model-footer">
          <div className="m-3 d-flex justify-content-end">
            <Button onClick={handleClose} btnName="Close" newClass="close-model-btn me-3" />
            <Button onClick={handleSubmit} btnName="Submit" newClass="submit-btn" disabled={!csvFile} />
          </div>
        </div>
      </Box>
    </Modal>
  );
}

export default connect(null, { uploadTranslationCsv })(UploadCsvDialog);
