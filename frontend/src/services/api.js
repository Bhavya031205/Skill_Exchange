import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API helper functions
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  getUser: (id) => api.get(`/auth/users/${id}`)
};

export const skillsApi = {
  getAll: (params) => api.get('/skills', { params }),
  getMy: () => api.get('/skills/my'),
  add: (data) => api.post('/skills', data),
  update: (id, data) => api.put(`/skills/${id}`, data),
  delete: (id) => api.delete(`/skills/${id}`),
  search: (query) => api.get('/skills/search', { params: { q: query } })
};

export const sessionsApi = {
  getAll: (params) => api.get('/sessions', { params }),
  getOne: (id) => api.get(`/sessions/${id}`),
  create: (data) => api.post('/sessions', data),
  update: (id, data) => api.put(`/sessions/${id}`, data),
  complete: (id, data) => api.post(`/sessions/${id}/complete`, data)
};

export const matchesApi = {
  find: () => api.post('/matches/find'),
  getAll: () => api.get('/matches'),
  accept: (id) => api.post(`/matches/${id}/accept`),
  decline: (id) => api.post(`/matches/${id}/decline`)
};

export const gamesApi = {
  spin: () => api.post('/games/spin'),
  startSpeedMatch: () => api.post('/games/speed-match/start'),
  submitSpeedMatch: (data) => api.post('/games/speed-match/submit', data),
  getStats: () => api.get('/games/stats'),
  getLeaderboard: (params) => api.get('/games/leaderboard', { params })
};

export const shopApi = {
  getItems: (params) => api.get('/shop/items', { params }),
  purchase: (itemId) => api.post('/shop/purchase', { itemId }),
  getInventory: () => api.get('/shop/inventory')
};
