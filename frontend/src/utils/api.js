import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data) => api.put('/auth/update-password', data)
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getMyApplications: () => api.get('/users/applications'),
  getApplicationById: (id) => api.get(`/users/applications/${id}`),
  getMyPasses: () => api.get('/users/passes'),
  getMyPayments: () => api.get('/users/payments'),
  getNotifications: () => api.get('/users/notifications'),
  markNotificationRead: (id) => api.put(`/users/notifications/${id}`)
};

export const applicationAPI = {
  create: (data) => api.post('/applications', data),
  getById: (id) => api.get(`/applications/${id}`),
  renew: (id, data) => api.post(`/applications/${id}/renew`, data),
  download: (id) => api.get(`/applications/${id}/download`, { responseType: 'blob' }),
  cancel: (id) => api.delete(`/applications/${id}/cancel`),
  approve: (id, data) => api.put(`/applications/${id}/approve`, data),
  reject: (id, data) => api.put(`/applications/${id}/reject`, data)
};

export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getApplications: (params) => api.get('/admin/applications', { params }),
  approveApplication: (id, data) => api.put(`/applications/${id}/approve`, data),
  rejectApplication: (id, data) => api.put(`/applications/${id}/reject`, data),
  exportApplications: (params) => api.get('/admin/applications/export', { params, responseType: 'blob' }),
  getReports: (params) => api.get('/admin/reports', { params })
};

export const routeAPI = {
  getAll: (params) => api.get('/routes', { params }),
  getById: (id) => api.get(`/routes/${id}`),
  search: (q) => api.get('/routes/search', { params: { q } }),
  create: (data) => api.post('/routes', data),
  update: (id, data) => api.put(`/routes/${id}`, data),
  updateFare: (id, data) => api.put(`/routes/${id}/fare`, data),
  delete: (id) => api.delete(`/routes/${id}`)
};

export const paymentAPI = {
  create: (data) => api.post('/payments', data),
  getById: (id) => api.get(`/payments/${id}`),
  getAll: (params) => api.get('/payments', { params }),
  getStats: () => api.get('/payments/stats'),
  refund: (id, data) => api.put(`/payments/${id}/refund`, data),
  createRazorpayOrder: (data) => api.post('/payments/razorpay/order', data),
  verifyRazorpayPayment: (data) => api.post('/payments/razorpay/verify', data),
};

export const kycAPI = {
  getStatus: () => api.get('/kyc/status'),
  sendAadhaarOtp: (aadhaarNumber) => api.post('/kyc/aadhaar/send-otp', { aadhaarNumber }),
  verifyAadhaarOtp: (otp) => api.post('/kyc/aadhaar/verify-otp', { otp }),
  verifyPan: (panNumber) => api.post('/kyc/pan/verify', { panNumber }),
};

export const verificationAPI = {
  verify: (qrData) => api.post('/verification/verify', { qrData }),
  verifyByNumber: (passNumber) => api.get(`/verification/verify/${passNumber}`),
  generateQR: (data) => api.post('/verification/generate-qr', data),
  getHistory: () => api.get('/verification/history')
};

export default api;
