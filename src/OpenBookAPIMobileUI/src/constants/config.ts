// API Configuration Constants
import Config from 'react-native-config';

// Environment Types
export type Environment = 'development' | 'pre' | 'production';

// Get current environment
export const getCurrentEnvironment = (): Environment => {
    return (Config.ENV_NAME as Environment) || 'development';
};

// Check if current environment is development
export const isDevelopment = (): boolean => getCurrentEnvironment() === 'development';

// Check if current environment is pre-production
export const isPreProduction = (): boolean => getCurrentEnvironment() === 'pre';

// Check if current environment is production
export const isProduction = (): boolean => getCurrentEnvironment() === 'production';

export const API_CONFIG = {
    // Base URL from environment config
    BASE_URL: Config.API_BASE_URL || 'http://10.0.2.2:5041',

    // Timeout from environment config (parse string to number)
    TIMEOUT: parseInt(Config.API_TIMEOUT || '30000', 10),

    ENDPOINTS: {
        BOOKS: {
            SEARCH: '/api/books/search',
            DETAIL: '/api/books',
            ISBN: '/api/books/isbn',
        },
        AUTHORS: {
            SEARCH: '/api/authors/search',
            DETAIL: '/api/authors',
            WORKS: '/api/authors', // /{authorKey}/works
        },
    },

    DEFAULT_PAGINATION: {
        PAGE: 1,
        LIMIT: 20,
    },
};

export const APP_CONFIG = {
    NAME: 'Read Land',
    VERSION: '1.0.0',
    ENVIRONMENT: getCurrentEnvironment(),
};

// Debug logging for environment (only in development)
if (__DEV__) {
    console.log('📱 App Environment:', getCurrentEnvironment());
    console.log('🌐 API Base URL:', API_CONFIG.BASE_URL);
}
