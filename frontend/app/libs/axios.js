import axios from "axios";

const axiosInstance = axios.create({
  baseURL:  "https://dupliacteversion.vercel.app/api", 
  withCredentials: true,
});

export default axiosInstance;