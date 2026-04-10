import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  // Prevent sending tokens only on strict public authentication routes
  const publicRoutes = ['auth/login/', 'auth/register/', 'auth/password-reset'];
  const isPublicRoute = publicRoutes.some(route => config.url.includes(route));
  
  if (token && !isPublicRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Clear token on 401 error to prevent getting stuck
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      if (window.location.pathname !== '/login') {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
