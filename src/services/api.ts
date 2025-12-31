import axios from 'axios';
import NProgress from 'nprogress';
import { getTenantFromBrowser } from '../utils/tenant';
// import { toast } from 'sonner';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://api.atomsuit.test/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  NProgress.start();

  // Add authentication token
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add tenant header for multi-tenant support
  try {
    const tenant = getTenantFromBrowser();

    if (!tenant.isCentral && tenant.subdomain) {
      config.headers['X-Tenant'] = tenant.subdomain;
    }
  } catch {
    // If tenant extraction fails, continue without X-Tenant header
    // Silently continue without tenant header if extraction fails
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    NProgress.done();
    // if (response.data.message) {
    //   toast.success(response.data.message);
    // }
    return response;
  },
  (error) => {
    NProgress.done();

    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      const isLogoutRequest = error.config.url === '/logout';
      const isLoginRequest = error.config.url === '/login';

      // Only trigger logout event if it's not a logout or login request
      if (!isLogoutRequest && !isLoginRequest) {
        // Clear local storage immediately
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];

        // Dispatch logout event
        window.dispatchEvent(new Event('logout'));
      }
    }

    // if (error.response?.data?.message) {
    //   toast.error(error.response.data.message);
    // }
    return Promise.reject(error);
  }
);

export default api;
