import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if ([401, 403].includes(error.response?.status) && !window.location.pathname.startsWith('/admin/login')) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

const unwrap = (request, selector = (data) => data) => request.then((response) => ({
  ...response,
  data: selector(response.data?.data),
}));

export const adminAuthAPI = {
  login: (credentials) => unwrap(apiClient.post('/auth/login', credentials)),
  logout: () => unwrap(apiClient.post('/auth/logout')),
  getProfile: () => unwrap(apiClient.get('/auth/profile')),
};

export const adminUserAPI = {
  getUsers: (params) => unwrap(apiClient.get('/admin/users', { params })),
  getUser: (userId) => unwrap(apiClient.get(`/admin/users/${userId}`)),
  updateUser: (userId, data) => unwrap(apiClient.put(`/admin/users/${userId}`, data)),
  deleteUser: (userId) => unwrap(apiClient.delete(`/admin/users/${userId}`)),
  updateUserPlan: (userId, data) => unwrap(apiClient.post(`/admin/users/${userId}/subscription`, data)),
  toggleUserStatus: (userId) => unwrap(apiClient.patch(`/admin/users/${userId}/toggle-status`)),
};

export const adminPlanAPI = {
  getPlans: () => unwrap(apiClient.get('/admin/plans')),
  createPlan: (data) => unwrap(apiClient.post('/admin/plans', data)),
  updatePlan: (planId, data) => unwrap(apiClient.put(`/admin/plans/${planId}`, data)),
  deletePlan: (planId) => unwrap(apiClient.delete(`/admin/plans/${planId}`)),
  togglePlanStatus: (planId) => unwrap(apiClient.patch(`/admin/plans/${planId}/toggle`)),
};

export const adminPostAPI = {
  getPosts: (params) => unwrap(apiClient.get('/admin/posts', { params })),
  getPost: (postId) => unwrap(apiClient.get(`/admin/posts/${postId}`)),
  deletePost: (postId) => unwrap(apiClient.delete(`/admin/posts/${postId}`)),
};

export const adminCardAPI = {
  getCardSettings: () => unwrap(apiClient.get('/admin/card-settings')),
  updateCardSettings: (cardIndex, data) => unwrap(apiClient.put(`/admin/card-settings/${cardIndex}`, data)),
  resetCardSettings: (cardIndex) => unwrap(apiClient.post(`/admin/card-settings/${cardIndex}/reset`)),
  uploadCardDefaultMedia: (cardIndex, formData) => unwrap(apiClient.post(
    `/admin/card-settings/${cardIndex}/default-media`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )),
};

export const adminSettingsAPI = {
  getSettings: () => unwrap(apiClient.get('/settings'), (data) => data?.settings || {}),
  updateSettings: (settings) => unwrap(apiClient.put('/settings', { settings })),
  uploadAsset: (formData) => unwrap(apiClient.post('/settings/upload-branding', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })),
};

export const adminLogsAPI = {
  getLogs: (params) => unwrap(apiClient.get('/admin/activity-logs', { params })),
};

export const adminStatsAPI = {
  getDashboard: () => unwrap(apiClient.get('/admin/stats')),
};

export const adminAPI = {
  ...adminUserAPI,
  ...adminPlanAPI,
  ...adminPostAPI,
  ...adminCardAPI,
  getActivityLogs: adminLogsAPI.getLogs,
  getStats: adminStatsAPI.getDashboard,
  getUserStats: (userId) => unwrap(apiClient.get(`/admin/users/${userId}/stats`)),
  resetUserPassword: (userId, data) => unwrap(apiClient.post(`/admin/users/${userId}/reset-password`, data)),
  assignPlanToUser: (userId, data) => unwrap(apiClient.post(`/admin/users/${userId}/subscription`, data)),
  getUserSubscriptions: (userId) => unwrap(apiClient.get(`/admin/users/${userId}/subscriptions`)),
  cancelSubscription: (subscriptionId) => unwrap(apiClient.delete(`/admin/subscriptions/${subscriptionId}`)),
  getUserFeatureOverrides: (userId) => unwrap(apiClient.get(`/admin/users/${userId}/feature-overrides`)),
  addFeatureOverride: (userId, data) => unwrap(apiClient.post(`/admin/users/${userId}/feature-overrides`, data)),
  deleteFeatureOverride: (overrideId) => unwrap(apiClient.delete(`/admin/feature-overrides/${overrideId}`)),
};

export default apiClient;
