import axios from 'axios';

// Simple axios instance
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export default api;
