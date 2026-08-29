import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2';
// toast.configure();

export const setToast = (type, data) => {
  return toast(data, {
    type: type,
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    rtl: false,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#6e6e6eef ',
  });
};

