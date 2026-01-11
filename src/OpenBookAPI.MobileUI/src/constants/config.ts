import Config from 'react-native-config';

export const API_CONFIG = {
    BASE_URL: Config.API_BASE_URL || 'http://localhost:5041/api',
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
};

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
};

export const STORAGE_KEYS = {
    AUTH_TOKEN: '@openbook:auth_token',
    USER_PREFERENCES: '@openbook:user_preferences',
    SEARCH_HISTORY: '@openbook:search_history',
};
