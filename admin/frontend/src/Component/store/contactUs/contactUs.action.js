import axios from "axios";
import * as ActionType from "./contactUs.type";
import { setToast } from "../../../util/toast";
import { apiInstanceFetch } from "../../../util/api";

export const getContactUsData = () => (dispatch) => {
  apiInstanceFetch
      .get(`admin/contact`)
      .then((res) => {
        dispatch({ type: ActionType.GET_CONTACT_DATA, payload:res.contact});
      })
      .catch((error) => console.error(error));
  };
  
  export const createContactUs= (formData) => (dispatch) => {
    axios
      .post("admin/contact/create", formData)
      .then((res) => {
        if (res.data.status) {
          dispatch({ type: ActionType.ADD_CONTACT, payload:res.data.contact });
          setToast("success", "Contact Added Successfully !");
        }
      })
      .catch((error) => console.error(error));
  };
  
  export const updateContactUs = (formData, id) => (dispatch) => {
    axios
      .patch(`admin/contact/update?contactId=${id}`, formData)
      .then((res) => {
        if (res.data.status) {
          dispatch({
            type: ActionType.UPDATE_CONTACT,
            payload: { editContact: res.data.contact , id:id },
          });
          setToast("success", "Contact Update Successfully");
        } else {
          setToast("error", res.data.message);
        }
      })
      .catch((error) => setToast("error", error.message));
  };

  export const deleteContactUs = (id) => (dispatch) => {
    axios
      .delete(`admin/contact/delete?contactId=${id}`)
      .then((res) => {
        if (res.data.status) {
          dispatch({ type: ActionType.DELETE_CONTACT, payload:id});
          setToast("success","Contact Delete SuccessFully");
        } else {
          setToast("error", res.data.message);
        }
      })
      .catch((error) => console.log(error));
  };