import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../constants/config';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Add auth token if available
        // const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    },
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        // Handle specific error codes
        if (error.response?.status === 401) {
            // Handle unauthorized - clear token and redirect to login
            // await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        }

        if (error.response?.status === 429) {
            // Handle rate limiting
            console.warn('Rate limit exceeded. Please try again later.');
        }

        return Promise.reject(error);
    },
);

export default apiClient;
