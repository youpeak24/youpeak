
import { useEffect } from "react";
import axios from "axios";

const AxiosInterceptor = () => {
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response &&
          [401].includes(error.response.status)
        ) {
          sessionStorage.clear();
          delete axios.defaults.headers.common["key"];
          delete axios.defaults.headers.common["Authorization"];
          window.location.href = "/";
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return null;
};

export default AxiosInterceptor;
