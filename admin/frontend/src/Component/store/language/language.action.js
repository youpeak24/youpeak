import { apiInstanceFetch } from "../../../util/api";
import axios from "axios";
import { setToast } from "../../../util/toast";
import { warning } from "../../../util/Alert";
import {
  GET_LANGUAGES,
  ADD_LANGUAGE,
  UPDATE_LANGUAGE,
  TOGGLE_LANGUAGE_STATE,
  DELETE_LANGUAGE,
} from "./language.type";

// Get all languages
export const getLanguages = (start, limit, search) => (dispatch) => {
  const queryParams = new URLSearchParams();
  if (start !== undefined && start !== null) queryParams.append("start", start);
  if (limit) queryParams.append("limit", limit);
  if (search) queryParams.append("search", search);

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return apiInstanceFetch
    .get(`admin/language/harvestLanguages${queryString}`)
    .then((res) => {
      if (res.status === false) {
         setToast("error", res.message || "Failed to fetch languages");
      } else if (res.status) {
        const langList = res.languages || res.data || [];
        dispatch({
          type: GET_LANGUAGES,
          payload: {
            languages: langList,
            totalLanguages: res.total !== undefined && res.total !== null ? res.total : langList.length,
          },
        });
      }
      return res;
    })
    .catch((error) => {
      console.log(error);
      setToast("error", error?.message || "Failed to fetch languages");
      throw error;
    });
};

// Add Language
export const addLanguage = (data) => (dispatch) => {
  axios
    .post("admin/language/forgeLanguage", data)
    .then((res) => {
      if (res.data.status) {
        dispatch({ type: ADD_LANGUAGE, payload: res.data.language || res.data.data });
        setToast("success", res.data.message);
        dispatch(getLanguages(1, 20, "")); // Refresh the list
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => setToast("error", error?.message || "Failed to add language"));
};

// Update Language
export const updateLanguage = (data) => (dispatch) => {
  axios
    .patch("admin/language/refineLanguage", data)
    .then((res) => {
      if (res.data.status) {
        dispatch({ type: UPDATE_LANGUAGE, payload: res.data.language || res.data.data });
        setToast("success", res.data.message);
        dispatch(getLanguages(1, 20, ""));
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => setToast("error", error?.message || "Failed to update language"));
};

// Toggle Language Status
export const toggleLanguageState = (languageCode, toggleType, actionText) => (dispatch) => {
  axios
    .patch(`admin/language/shiftLanguageState?languageCode=${languageCode}&toggleType=${toggleType}`)
    .then((res) => {
      if (res.data.status) {
        dispatch({ type: TOGGLE_LANGUAGE_STATE, payload: { languageCode, toggleType } });
        setToast("success", res.data.message);
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => setToast("error", error?.message || "Failed to shift language state"));
};

// Delete Language
export const deleteLanguage = (languageCode) => (dispatch) => {
  const confirmation = warning("Are you sure?", "This will delete the language and all its translations!");
  confirmation.then((res) => {
    if (res.isConfirmed) {
      axios
        .delete(`admin/language/obliterateLanguage?languageCode=${languageCode}`)
        .then((res) => {
          if (res.data.status) {
            dispatch({ type: DELETE_LANGUAGE, payload: languageCode });
            setToast("success", res.data.message);
            dispatch(getLanguages(1, 20, ""));
          } else {
            setToast("error", res.data.message || "Failed to delete language");
          }
        })
        .catch((error) => setToast("error", error?.message || "Failed to delete language"));
    }
  });
};
