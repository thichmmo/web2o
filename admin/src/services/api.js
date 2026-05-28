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
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not on login page already
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        // Use React Router navigation instead of hard reload
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  login: (data) => apiClient.post('/auth/login', data),
  getProfile: () => apiClient.get('/auth/profile'),
};

// Admin API
export const adminAPI = {
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  getUser: (userId) => apiClient.get(`/admin/users/${userId}`),
  getUserStats: (userId) => apiClient.get(`/admin/users/${userId}/stats`),
  updateUser: (userId, data) => apiClient.put(`/admin/users/${userId}`, data),
  resetUserPassword: (userId, data) => apiClient.post(`/admin/users/${userId}/reset-password`, data),
  deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`),
  assignPlanToUser: (userId, data) => apiClient.post(`/admin/users/${userId}/subscription`, data),
  getUserSubscriptions: (userId) => apiClient.get(`/admin/users/${userId}/subscriptions`),
  cancelSubscription: (subscriptionId) => apiClient.delete(`/admin/subscriptions/${subscriptionId}`),
  getUserFeatureOverrides: (userId) => apiClient.get(`/admin/users/${userId}/feature-overrides`),
  addFeatureOverride: (userId, data) => apiClient.post(`/admin/users/${userId}/feature-overrides`, data),
  deleteFeatureOverride: (overrideId) => apiClient.delete(`/admin/feature-overrides/${overrideId}`),
  getActivityLogs: (params) => apiClient.get('/admin/activity-logs', { params }),
  getStats: () => apiClient.get('/admin/stats'),
  getCardSettings: () => apiClient.get('/admin/card-settings'),
  getCardSettingByIndex: (cardIndex) => apiClient.get(`/admin/card-settings/${cardIndex}`),
  updateCardSettings: (cardIndex, data) => apiClient.put(`/admin/card-settings/${cardIndex}`, data),
  resetCardSettings: (cardIndex) => apiClient.post(`/admin/card-settings/${cardIndex}/reset`),
  uploadCardDefaultMedia: (cardIndex, formData) => apiClient.post(`/admin/card-settings/${cardIndex}/default-media`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getPlans: () => apiClient.get('/admin/plans'),
  getPlan: (planId) => apiClient.get(`/admin/plans/${planId}`),
  createPlan: (data) => apiClient.post('/admin/plans', data),
  updatePlan: (planId, data) => apiClient.put(`/admin/plans/${planId}`, data),
  deletePlan: (planId) => apiClient.delete(`/admin/plans/${planId}`),
  togglePlanStatus: (planId) => apiClient.patch(`/admin/plans/${planId}/toggle`),
  getPosts: (params) => apiClient.get('/admin/posts', { params }),
  getPost: (postId) => apiClient.get(`/admin/posts/${postId}`),
  deletePost: (postId) => apiClient.delete(`/admin/posts/${postId}`),
};

// Settings API
export const settingsAPI = {
  getPublicSettings: () => apiClient.get('/settings/public'),
  getSettings: () => apiClient.get('/settings'),
  updateSettings: (data) => apiClient.put('/settings', data),
  uploadBranding: (formData) => apiClient.post('/settings/upload-branding', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export default apiClient;
