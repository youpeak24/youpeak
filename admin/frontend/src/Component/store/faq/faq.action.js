import axios from "axios";
import * as ActionType from "./faq.type";
import { setToast } from "../../../util/toast";
import { apiInstanceFetch } from "../../../util/api";

export const getFaqApi = () => (dispatch) => {
  apiInstanceFetch
      .get(`client/FAQ`)
      .then((res) => {
        dispatch({ type: ActionType.GET_FAQ, payload: res.FaQ });
      })
      .catch((error) => console.error(error));
  };
  

  export const addFaqApi= (formData) => (dispatch) => {
    axios
      .post("admin/FAQ/create", formData)
      .then((res) => {
        if (res.data.status === true) {
          dispatch({ type: ActionType.ADD_FAQ, payload: res.data.FaQ });
          setToast("success", "Faq Created Successfully !");
        }
      })
      .catch((error) => console.error(error));
    };
    
    export const editFaqApi = (id,data) => (dispatch) => {
    axios
      .patch(`admin/FAQ/update?FaQId=${id}`,data)
      .then((res) => {
        if (res.data.status) {
          dispatch({
            type: ActionType.EDIT_FAQ,
            payload: {editData:res.data.FaQ,editId:id} ,
          });
          setToast("success","Faq Edit SuccessFully" ,);
        } else {
          setToast("error", res.data.message);
        }
      })
      .catch((error) => console.log("error", error.message));
    };


    export const deleteFaq = (id) => (dispatch) => {
      axios
        .delete(`admin/FAQ/delete?FaQId=${id}`)
        .then((res) => {
          if (res.data.status) {
            dispatch({ type: ActionType.DELETE_FAQ, payload: {id:id} });
            setToast("success","Faq Delete SuccessFully");
          } else {
            setToast("error", res.data.message);
          }
        })
        .catch((error) => console.log(error));
    };
    
    
