import React, { useEffect, useState } from "react";
import { Box, Modal } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { getLanguages } from "../store/language/language.action";
import Button from "../extra/Button";

function LanguageRequiredDialog() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { totalLanguages } = useSelector((state) => state.language);

  const [hasChecked, setHasChecked] = useState(false);
  const [open, setOpen] = useState(false);

  const isOnAppLanguages = location.pathname.includes("/appLanguage");

  useEffect(() => {
    let cancelled = false;

    const checkLanguages = async () => {
      setHasChecked(false);
      try {
        await dispatch(getLanguages(1, 1, ""));
      } catch (e) {
        // Error toast handled in action; keep dialog closed on failure
      } finally {
        if (!cancelled) setHasChecked(true);
      }
    };

    checkLanguages();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!hasChecked || isOnAppLanguages) {
      setOpen(false);
      return;
    }
    setOpen(totalLanguages === 0);
  }, [hasChecked, totalLanguages, isOnAppLanguages]);

  const handleGoToAppLanguages = () => {
    setOpen(false);
    navigate("/admin/appLanguage");
  };

  return (
    <Modal
      open={open}
      onClose={() => {}}
      disableEscapeKeyDown
      aria-labelledby="language-required-dialog-title"
    >
      <Box className="model-style">
        <div className="model-header">
          <p className="m-0" id="language-required-dialog-title">
            Language Required
          </p>
        </div>
        <div className="model-body">
          <p className="m-0">
            At least one app language is required. Please add a language to
            continue.
          </p>
        </div>
        <div className="model-footer">
          <div className="m-3 d-flex justify-content-end">
            <Button
              onClick={handleGoToAppLanguages}
              btnName="Go to App Languages"
              newClass="submit-btn"
            />
          </div>
        </div>
      </Box>
    </Modal>
  );
}

export default LanguageRequiredDialog;
