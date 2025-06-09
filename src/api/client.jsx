import axios from 'axios';
import { useNotifications } from '../contexts/NotificationContext';
const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // Replace with your API base URL
    timeout: 10000, // Request timeout in milliseconds
    headers: {
        'Content-Type': 'application/json',

    },
    withCredentials: true, // Include credentials for cross-origin requests
    responseType: 'json', // Default response type
});

// Add a request interceptor
client.interceptors.request.use(
    (config) => {
        // Modify config before request is sent (e.g., add auth token)
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Handle request error
        return Promise.reject(error);
    }
);

// Add a response interceptor
client.interceptors.response.use(
    (response) => {
        // Any status code within the range of 2xx triggers this function
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default client;