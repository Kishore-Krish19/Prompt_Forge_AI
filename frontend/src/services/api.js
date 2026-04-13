import axios from 'axios';

const AUTH_BASE = window.__PF_API_BASE__ || 'http://localhost:8000';

const API = axios.create({
  baseURL: AUTH_BASE,
});

// Attach auth header automatically
API.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {}
  return config;
});

export default API;

export const sendOtp = async (email) => {
  const res = await API.post('/api/auth/send-otp', { email });
  return res.data;
};

export const verifyOtp = async (email, otp) => {
  const res = await API.post('/api/auth/verify-otp', { email, otp });
  return res.data;
};

export const setPassword = async (email, password) => {
  const res = await API.post('/api/auth/set-password', { email, password });
  return res.data;
};

export const login = async (email, password) => {
  const res = await API.post('/api/auth/login', { email, password });
  return res.data;
};

export const fetchUsers = async () => {
  const res = await API.get('/api/admin/users');
  return res.data;
};
