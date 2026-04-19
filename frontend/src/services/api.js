import axios from 'axios';
 
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.PROD) return '/api';
  return 'http://localhost:3001/api';
};
 
const API_URL = getApiUrl();
 
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});
 
// Auth token injection
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);
 
// Token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefresh } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefresh);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
 
export default api;
 
// ── Auth ──────────────────────────────────────────────────────────
export const authApi = {
  login:         (email, password) => api.post('/auth/login', { email, password }),
  register:      (data) => api.post('/auth/register', data),
  getMe:         () => api.get('/auth/me'),
  getUser:       (id) => api.get(`/auth/users/${id}`),
  // Profile update — tries PUT /auth/profile, falls back gracefully
  updateProfile: (data) => api.put('/auth/profile', data).catch(() =>
    // fallback: some backends use /auth/me with PATCH
    api.patch('/auth/me', data)
  ),
  uploadAvatar:  (formData) => api.put('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  changePassword: (data) => api.put('/auth/password', data).catch(() =>
    api.put('/auth/change-password', data)
  ),
};
 
// ── Skills ────────────────────────────────────────────────────────
export const skillsApi = {
  getAll:  (params) => api.get('/skills', { params }),
  getMy:   () => api.get('/skills/my'),
  add:     (data) => api.post('/skills', data),
  update:  (id, data) => api.put(`/skills/${id}`, data),
  delete:  (id) => api.delete(`/skills/${id}`),
  search:  (query) => api.get('/skills/search', { params: { q: query } }),
};
 
// ── Sessions ──────────────────────────────────────────────────────
export const sessionsApi = {
  getAll:   (params) => api.get('/sessions', { params }),
  getOne:   (id) => api.get(`/sessions/${id}`),
  create:   (data) => api.post('/sessions', data),
  update:   (id, data) => api.put(`/sessions/${id}`, data),
  complete: (id, data) => api.post(`/sessions/${id}/complete`, data),
};
 
// ── Notifications ─────────────────────────────────────────────────
export const notificationsApi = {
  getAll:      (params) => api.get('/notifications', { params }),
  markRead:    (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete:      (id) => api.delete(`/notifications/${id}`),
};
 
// ── Matches ───────────────────────────────────────────────────────
export const matchesApi = {
  find:    () => api.post('/matches/find'),
  getAll:  () => api.get('/matches'),
  accept:  (id) => api.post(`/matches/${id}/accept`),
  decline: (id) => api.post(`/matches/${id}/decline`),
};
 
// ── Games ─────────────────────────────────────────────────────────
export const gamesApi = {
  spin:             () => api.post('/games/spin'),
  startSpeedMatch:  () => api.post('/games/speed-match/start'),
  submitSpeedMatch: (data) => api.post('/games/speed-match/submit', data),
  getStats:         () => api.get('/games/stats'),
  getLeaderboard:   (params) => api.get('/games/leaderboard', { params }),
};
 
// ── Shop ──────────────────────────────────────────────────────────
export const shopApi = {
  getItems:   (params) => api.get('/shop/items', { params }),
  purchase:   (itemId) => api.post('/shop/purchase', { itemId }),
  getInventory: () => api.get('/shop/inventory'),
};