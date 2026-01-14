// API Configuration Constants

export const API_CONFIG = {
    // Update this to your actual API URL
    // For Android emulator, use 10.0.2.2 instead of localhost
    BASE_URL: __DEV__ ? 'http://10.0.2.2:5041' : 'https://your-production-api.com',

    TIMEOUT: 30000, // 30 seconds

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
    NAME: 'OpenBook',
    VERSION: '1.0.0',
};
