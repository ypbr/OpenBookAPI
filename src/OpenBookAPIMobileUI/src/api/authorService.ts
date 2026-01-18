import { API_CONFIG } from '../constants/config';
import {
    AuthorDetail,
    AuthorSearchResult,
    AuthorWorks,
    PaginationParams,
    SearchParams,
} from '../types/api.types';
import { apiClient } from './apiClient';

export const authorService = {
    /**
     * Search for authors by query
     */
    search: async (params: SearchParams): Promise<AuthorSearchResult> => {
        const { query, page, limit } = params;
        return apiClient.get<AuthorSearchResult>(API_CONFIG.ENDPOINTS.AUTHORS.SEARCH, {
            query,
            page: page ?? API_CONFIG.DEFAULT_PAGINATION.PAGE,
            limit: limit ?? API_CONFIG.DEFAULT_PAGINATION.LIMIT,
        });
    },

    /**
     * Get author details by author key
     */
    getByAuthorKey: async (authorKey: string): Promise<AuthorDetail> => {
        if (!authorKey) {
            throw new Error('Author key is required');
        }
        // Remove /authors/ prefix if present
        const cleanKey = authorKey.replace('/authors/', '');
        return apiClient.get<AuthorDetail>(`${API_CONFIG.ENDPOINTS.AUTHORS.DETAIL}/${cleanKey}`);
    },

    /**
     * Get works by an author
     */
    getWorks: async (
        authorKey: string,
        params?: PaginationParams,
    ): Promise<AuthorWorks> => {
        if (!authorKey) {
            throw new Error('Author key is required');
        }
        const cleanKey = authorKey.replace('/authors/', '');
        return apiClient.get<AuthorWorks>(
            `${API_CONFIG.ENDPOINTS.AUTHORS.WORKS}/${cleanKey}/works`,
            {
                page: params?.page ?? API_CONFIG.DEFAULT_PAGINATION.PAGE,
                limit: params?.limit ?? API_CONFIG.DEFAULT_PAGINATION.LIMIT,
            },
        );
    },
};
