// src/api/axiosInstance.js
import axios from 'axios';

/**
 * @file Centralized Axios instance for making API requests.
 * @description Configures a base URL and includes request/response interceptors
 * for consistent handling of headers (e.g., authentication tokens) and errors.
 */

// const API_BASE_URL = 'http://localhost:3000/api'; // Ensure this matches your Express API base URL
// const API_BASE_URL = 'http://192.168.100.12:6000/api'; // Ensure this matches your Express API base URL

const API_BASE_URL = 'http://192.168.100.12:3000/api'; // Ensure this matches your Express API base URL

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // Request timeout in milliseconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Adds Authorization: Bearer token to headers if available in localStorage
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken'); // Assuming token is stored as 'jwtToken'
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Changed to Bearer token
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Logs API errors and re-throws them for component-level handling
axiosInstance.interceptors.response.use(
    (response) => response, // If response is successful, just return it
    (error) => {
        console.error('API Response Error:', error.response || error.message);
        // If there's a response object (e.g., 4xx, 5xx errors), reject with its data
        // Otherwise, reject with a generic Error object
        return Promise.reject(error.response ? error.response.data : new Error(error.message));
    }
);

export default axiosInstance;
