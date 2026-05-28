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
    const token = localStorage.getItem('token');
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  changePassword: (data) => apiClient.post('/auth/change-password', data),
  logout: () => apiClient.post('/auth/logout'),
};

// Facebook API
export const facebookAPI = {
  getLoginUrl: () => apiClient.get('/facebook/login-url'),
  connectMock: () => apiClient.post('/facebook/mock-connect'),
  connectToken: (data) => apiClient.post('/facebook/token-connect', data),
  getAccounts: () => apiClient.get('/facebook/accounts'),
  getPages: (accountId) => apiClient.get(`/facebook/accounts/${accountId}/pages`),
  getAdAccounts: (accountId) => apiClient.get(`/facebook/accounts/${accountId}/ad-accounts`),
  getGroups: (accountId) => apiClient.get(`/facebook/accounts/${accountId}/groups`),
  disconnectAccount: (accountId) => apiClient.post(`/facebook/accounts/${accountId}/disconnect`),
};

// Post API
export const postAPI = {
  createPost: (formData) => apiClient.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getPosts: (params) => apiClient.get('/posts', { params }),
  getPost: (postId) => apiClient.get(`/posts/${postId}`),
  updatePost: (postId, formData) => apiClient.put(`/posts/${postId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  publishPost: (postId) => apiClient.post(`/posts/${postId}/publish`),
  retryPost: (postId) => apiClient.post(`/posts/${postId}/retry`),
  deletePost: (postId) => apiClient.delete(`/posts/${postId}`),
};

export const userAPI = {
  getDashboard: () => apiClient.get('/user/dashboard'),
  getSubscription: () => apiClient.get('/user/subscription'),
  getPlans: () => apiClient.get('/user/plans'),
  upgradePlan: (planId) => apiClient.post('/user/subscription/upgrade', { planId }),
  getPermissions: () => apiClient.get('/user/permissions'),
  getCardSettings: () => apiClient.get('/user/card-settings'),
  getProfileStats: () => apiClient.get('/user/profile/stats'),
};

export const settingsAPI = {
  getPublicSettings: () => apiClient.get('/settings/public'),
};

export const publicAPI = {
  getPlans: () => apiClient.get('/public/plans'),
};

export default apiClient;
