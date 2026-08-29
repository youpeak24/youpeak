import React, { useEffect, useState } from "react";
import { Box, Modal, Tabs, Tab } from "@mui/material";
import { connect, useDispatch, useSelector } from "react-redux";
import { CLOSE_DIALOGUE } from "../store/dialogue/dialogue.type";
import Button from "../extra/Button";

import { getTranslations, updateTranslations } from "../store/translation/translation.action";
import TablePagination from "react-js-pagination";

function TranslationDialog(props) {
  const { dialogue, dialogueType, dialogueData } = useSelector((state) => state.dialogue);
  const { translations } = useSelector((state) => state.translation);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("app");

  const [currentTranslations, setCurrentTranslations] = useState({});
  const [initialTranslations, setInitialTranslations] = useState({});
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  useEffect(() => {
    setPage(0);
  }, [search, activeTab]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (dialogueType === "translationManage") {
      setOpen(dialogue);
      // Fetch 'app' translations on open by default
      if (dialogueData?.languageCode) {
        dispatch(getTranslations(dialogueData.languageCode, "app"));
      }
    } else {
      setOpen(false);
    }
  }, [dialogue, dialogueData, dialogueType, dispatch]);

  useEffect(() => {
    if (translations) {
      setCurrentTranslations({ ...translations });
      setInitialTranslations({ ...translations });
      setIsSubmitDisabled(true);
    }
  }, [translations]);

  const filteredKeys = Object.keys(currentTranslations).filter(
    (key) =>
      key.toLowerCase().includes(search.toLowerCase()) ||
      String(currentTranslations[key]).toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredKeys.length / rowsPerPage) - 1);
    if (page > maxPage) setPage(maxPage);
  }, [filteredKeys.length, rowsPerPage]);


  const paginatedKeys = filteredKeys.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const from = filteredKeys.length === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min((page + 1) * rowsPerPage, filteredKeys.length);

  // When tab changes, fetch the respective translations
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (dialogueData?.languageCode) {
      dispatch(getTranslations(dialogueData.languageCode, newValue));
    }
  };

  const handleTranslationChange = (key, value) => {
    const updated = { ...currentTranslations, [key]: value };
    setCurrentTranslations(updated);

    // Check if any value changed
    let changed = false;
    for (const k in updated) {
      if (updated[k] !== initialTranslations[k]) {
        changed = true;
        break;
      }
    }

    // Also check if any key was deleted (shouldn't happen here, but cover all bases)
    setIsSubmitDisabled(!changed);
  };

  const handleClose = () => {
    setOpen(false);
    dispatch({ type: CLOSE_DIALOGUE, payload: { dialogue: false } });
    sessionStorage.setItem("dialogueData", JSON.stringify({ dialogue: false }));
    setActiveTab("app");
    setSearch("");
    setPage(0);
    setRowsPerPage(50);
  };



  const handleSubmit = async () => {


    const changedTranslations = {};
    for (const k in currentTranslations) {
      if (currentTranslations[k] !== initialTranslations[k]) {
        changedTranslations[k] = currentTranslations[k];
      }
    }

    if (Object.keys(changedTranslations).length === 0) return;

    const payload = {
      languageCode: dialogueData.languageCode,
      module: activeTab,
      translations: changedTranslations
    };

    const success = await props.updateTranslations(payload);
    if (success) {
      setInitialTranslations({ ...currentTranslations });
      setIsSubmitDisabled(true);
    }
  };

  if (dialogueType !== "translationManage") return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box className="model-style" sx={{ width: { xs: "95%", sm: "600px", md: "700px" }, maxWidth: "95vw", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div className="model-header d-flex justify-content-between">
          <p className="m-0">Translations for {dialogueData?.languageTitle || "Language"}</p>
        </div>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          className="border-bottom px-3"
        >
          <Tab value="app" label="App" />
          <Tab value="web" label="Web" />
        </Tabs>

        <div className="d-flex gap-2 p-2 mx-2">
          <div className="position-relative w-100">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search by key, translation"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <span
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                ✕
              </span>
            )}
          </div>

          <select
            className="form-select form-select-sm"
            style={{ width: "90px" }}
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
          >
            {[25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div
          className="flex-grow-1 d-flex flex-column mx-2 px-2"
          style={{ minHeight: "300px" }}
        >
          {translations === null ? (
            <div className="m-auto text-muted">Loading translations...</div>
          ) : filteredKeys.length === 0 ? (
            <div className="m-auto text-muted">
              {Object.keys(currentTranslations).length === 0
                ? "No translations found."
                : "No matches found."}
            </div>
          ) : (
            <div className="table-responsive border flex-grow-1">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th style={{ width: "30%" }}>Key</th>
                    <th style={{ width: "70%" }}>Translation</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedKeys.map((key) => (
                    <tr key={key}>
                      <td className="align-middle text-muted small">{key}</td>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm bg-light"
                          value={currentTranslations[key] || ""}
                          onChange={(e) =>
                            handleTranslationChange(key, e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filteredKeys.length > 0 && (
          <div className="custom-pagination mt-2 px-2 w-100">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                padding: "0px 10px"
              }}
            >
              <p
                style={{
                  marginBottom: "0px",
                  color: "#1F1F1F",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                Showing {from} to {to} out of {filteredKeys.length} entries
              </p>
              <div style={{ zoom: 0.85 }}>
                <TablePagination
                  activePage={page + 1}
                  itemsCountPerPage={rowsPerPage}
                  totalItemsCount={filteredKeys.length}
                  pageRangeDisplayed={3}
                  onChange={(p) => setPage(p - 1)}
                  itemClass="page-item"
                  linkClass="page-link"
                  innerClass="pagination pagination-sm mb-0"
                />
              </div>
            </div>
          </div>
        )}

        <div className="model-footer pt-3 mt-auto">
          <div className="m-3 d-flex justify-content-end">
            <Button onClick={handleClose} btnName="Close" newClass="close-model-btn me-3" />
            <Button
              onClick={handleSubmit}
              btnName="Submit"
              newClass="submit-btn"
              disabled={isSubmitDisabled}
            />
          </div>
        </div>
      </Box>
    </Modal>
  );
}

export default connect(null, { updateTranslations })(TranslationDialog);
