import { API_CONFIG } from '../constants/config';
import {
    BookDetail,
    BookSearchResult,
    SearchParams,
} from '../types/api.types';
import { apiClient } from './apiClient';

export const bookService = {
    /**
     * Search for books by query
     */
    search: async (params: SearchParams): Promise<BookSearchResult> => {
        const { query, page, limit } = params;
        return apiClient.get<BookSearchResult>(API_CONFIG.ENDPOINTS.BOOKS.SEARCH, {
            query,
            page: page ?? API_CONFIG.DEFAULT_PAGINATION.PAGE,
            limit: limit ?? API_CONFIG.DEFAULT_PAGINATION.LIMIT,
        });
    },

    /**
     * Get book details by work key
     */
    getByWorkKey: async (workKey: string): Promise<BookDetail> => {
        // Remove /works/ prefix if present
        const cleanKey = workKey.replace('/works/', '');
        return apiClient.get<BookDetail>(`${API_CONFIG.ENDPOINTS.BOOKS.DETAIL}/${cleanKey}`);
    },

    /**
     * Get book details by ISBN
     */
    getByIsbn: async (isbn: string): Promise<BookDetail> => {
        return apiClient.get<BookDetail>(`${API_CONFIG.ENDPOINTS.BOOKS.ISBN}/${isbn}`);
    },
};
