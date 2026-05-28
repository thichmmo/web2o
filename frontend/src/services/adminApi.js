import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const adminAuthAPI = {
  login: (credentials) => apiClient.post('/admin/auth/login', credentials),
  logout: () => apiClient.post('/admin/auth/logout'),
  getProfile: () => apiClient.get('/admin/auth/me'),
};

// User Management APIs
export const adminUserAPI = {
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  getUser: (userId) => apiClient.get(`/admin/users/${userId}`),
  updateUser: (userId, data) => apiClient.put(`/admin/users/${userId}`, data),
  deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`),
  updateUserPlan: (userId, data) => apiClient.put(`/admin/users/${userId}/plan`, data),
  toggleUserStatus: (userId) => apiClient.patch(`/admin/users/${userId}/toggle-status`),
};

// Plan Management APIs
export const adminPlanAPI = {
  getPlans: () => apiClient.get('/admin/plans'),
  createPlan: (data) => apiClient.post('/admin/plans', data),
  updatePlan: (planId, data) => apiClient.put(`/admin/plans/${planId}`, data),
  deletePlan: (planId) => apiClient.delete(`/admin/plans/${planId}`),
};

// Post Management APIs
export const adminPostAPI = {
  getPosts: (params) => apiClient.get('/admin/posts', { params }),
  getPost: (postId) => apiClient.get(`/admin/posts/${postId}`),
  deletePost: (postId) => apiClient.delete(`/admin/posts/${postId}`),
};

// Card Settings APIs
export const adminCardAPI = {
  getCardSettings: () => apiClient.get('/admin/card-settings'),
  updateCardSettings: (data) => apiClient.put('/admin/card-settings', data),
  uploadCardImage: (formData) => apiClient.post('/admin/card-settings/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Settings APIs
export const adminSettingsAPI = {
  getSettings: () => apiClient.get('/admin/settings'),
  updateSettings: (data) => apiClient.put('/admin/settings', data),
  uploadAsset: (formData) => apiClient.post('/admin/settings/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Activity Logs APIs
export const adminLogsAPI = {
  getLogs: (params) => apiClient.get('/admin/activity-logs', { params }),
};

// Dashboard Stats APIs
export const adminStatsAPI = {
  getDashboard: () => apiClient.get('/admin/dashboard'),
};

export default apiClient;
