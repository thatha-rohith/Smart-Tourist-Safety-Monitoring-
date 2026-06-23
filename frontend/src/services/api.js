import axios from 'axios';

const API = axios.create({
  baseURL: 'https://smart-tourist-safety-monitoring-l7j0.onrender.com/api',
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('stsms_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('stsms_user');
      const path = window.location.pathname;
      if (path.startsWith('/tourist')) {
        window.location.href = '/tourist/login';
      } else if (path.startsWith('/dashboard')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
