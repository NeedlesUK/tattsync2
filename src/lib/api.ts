import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Log the request for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Authorization is handled by the AuthContext
    if (config.headers.Authorization) {
      console.log('Request has Authorization header');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error for debugging
    console.error('API Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Request timeout - backend server might be slow or unresponsive');
    } else if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
      console.error('❌ Backend server is not running or not accessible');
      console.error('Please start the backend server using: npm run start:backend');
    } else if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('❌ Server responded with error:', error.response.status, error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('❌ No response received from server');
    }
    return Promise.reject(error);
  }
);

export default api;