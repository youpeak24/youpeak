import { apiInstanceFetch } from "../../../util/api";
import axios from "axios";
import { setToast } from "../../../util/toast";
import { GET_TRANSLATIONS, UPDATE_TRANSLATIONS } from "./translation.type";

// Get single Language's translations
export const getTranslations = (languageCode, module) => (dispatch) => {
  dispatch({ type: GET_TRANSLATIONS, payload: null });
  apiInstanceFetch
    .get(`admin/translation/harvestTranslations?languageCode=${languageCode}&module=${module}`)
    .then((res) => {
      if (res.status === false) {
         dispatch({ type: GET_TRANSLATIONS, payload: {} });
         if (res.message && res.message !== "No translations found") {
            // don't always toast if it's just "No translations found" on purpose, but user asked to show server message:
            setToast("error", res.message);
         }
      } else if (res.status === true || res.doc) {
        dispatch({
          type: GET_TRANSLATIONS,
          payload: res?.doc?.translations || res?.data?.doc || {},
        });
      }
    })
    .catch((error) => {
      console.log(error);
      setToast("error", error?.message || "Failed to fetch translations");
    });
};

// Update translations
export const updateTranslations = (data) => (dispatch) => {
  return axios
    .patch("admin/translation/refineTranslations", data)
    .then((res) => {
      if (res.data.status) {
        // payload for update
        dispatch({ type: UPDATE_TRANSLATIONS, payload: data.translations });
        setToast("success", res.data.message);
        return true;
      } else {
        setToast("error", res.data.message);
        return false;
      }
    })
    .catch((error) => {
      setToast("error", error?.message || "Failed to update translations");
      return false;
    });
};

// Upload CSV File
export const uploadTranslationCsv = (formData, handleClose) => (dispatch) => {
  axios
    .post("admin/translation/infuseTranslations", formData)
    .then((res) => {
      if (res.data.status) {
        setToast("success", res.data.message);
        if (handleClose) handleClose();
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => {
      setToast("error", error?.response?.data?.message || error?.message || "Failed to upload translations CSV");
    });
};

// Download CSV File
export const downloadTranslationsCsv = () => (dispatch) => {
  axios
    .get("admin/translation/extractTranslationsCSV", { responseType: "blob" })
    .then((res) => {
      if (res.data.type === "application/json") {
          const reader = new FileReader();
          reader.onload = () => {
              try {
                  const result = JSON.parse(reader.result);
                  setToast("error", result.message || "Failed to download translations CSV");
              } catch (e) {
                  setToast("error", "Failed to download translations CSV");
              }
          };
          reader.readAsText(res.data);
          return;
      }
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "translations.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setToast("success", "File started downloading");
    })
    .catch((error) => setToast("error", error?.message || "Failed to download translations CSV"));
};
