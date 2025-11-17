import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("AXIOS ERROR CAUGHT:", {
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data,
      params: error.config?.params,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      response: error.response,
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;