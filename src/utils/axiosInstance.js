import axios from 'axios';

// Tạo 1 instance chung cho toàn dự án
const axiosInstance = axios.create();

// Add interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
