

  

import axios from "axios";
import { useDispatch } from "react-redux";
import { UPLOAD_FILE_AWS } from "../Component/store/dialogue/dialogue.type";
import {
  LOADER_OPEN,
  CLOSE_LOADER,
} from "../Component/store/dialogue/dialogue.type";
import store from "../Component/store/Provider";
import { folderStructurePath } from "./config";


export const uploadFile = async (FileName, folderStructure, dispatch, loaderType) => {
        store.dispatch({ type: LOADER_OPEN, payload: "upload-file" });

  try {
    const formData = new FormData();
    formData.append("folderStructure", folderStructurePath + "/" + folderStructure);
    formData.append("keyName", FileName?.name);
    formData.append("content", FileName);

    const response = await axios.post(`admin/file/upload-file`, formData, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        dispatch &&
          dispatch({
            type: UPLOAD_FILE_AWS,
            payload: {
              uploadFilePercent: percentCompleted, 
              loaderType: loaderType,
            },
          });
      },
    });

    // ✅ Backend से permanent URL मिलेगा
    const resDataUrl = response.data.url;
    return { resDataUrl };
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    store.dispatch({ type: CLOSE_LOADER, payload: "upload-file" });
  }
};

