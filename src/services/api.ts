import axios from 'axios';
import NProgress from 'nprogress';
// import { toast } from 'sonner';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
});

api.interceptors.request.use(config => {
  NProgress.start();
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(response => {
  NProgress.done();
  // if (response.data.message) {
  //   toast.success(response.data.message);
  // }
  return response;
}, error => {
  NProgress.done();
  if (error.response && error.response.status === 401 && error.config.url !== '/logout') {
    window.dispatchEvent(new Event('logout'));
  }
  // if (error.response?.data?.message) {
  //   toast.error(error.response.data.message);
  // }
  return Promise.reject(error);
});

export default api;
