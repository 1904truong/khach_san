import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

export const roomService = {
  getRooms: () => api.get('/rooms'),
  createRoom: (roomData) => api.post('/rooms', roomData),
};

export const bookingService = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getMyBookings: () => api.get('/bookings/my'),
  getAllBookings: () => api.get('/bookings/all'),
  cancelBooking: (bookingId, reason) => api.delete(`/bookings/${bookingId}`, { data: { reason } }),
  deleteBookingHistory: (bookingId) => api.patch(`/bookings/${bookingId}/hide`),
};

export const adminService = {
  getRevenueStats: () => api.get('/admin/revenue'),
  getOccupancyStats: () => api.get('/admin/occupancy'),
  getAdvancedStats: () => api.get('/admin/stats/advanced'),
  getReports: (params) => api.get('/admin/stats/reports', { params }),
};

export const paymentService = {
  createCheckoutSession: (bookingId) => api.post('/payments/create-checkout-session', { booking_id: bookingId }),
};

export const smartLockService = {
  generateCode: (bookingId) => api.post('/smartlock/generate', { booking_id: bookingId }),
  openLock: (data) => api.post('/smartlock/open', data),
};

export const ocrService = {
  extractId: (formData) => api.post('/ocr/extract', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  checkVerification: () => api.get('/ocr/status'),
};

export const housekeepingService = {
  updateStatus: (data) => api.post('/housekeeping/update', data),
};

export const userService = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (userData) => api.put('/users/update', userData),
  changePassword: (passwordData) => api.put('/users/change-password', passwordData),
};

export default api;
