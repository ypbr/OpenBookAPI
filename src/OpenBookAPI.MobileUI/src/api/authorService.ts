import { PAGINATION } from '../constants/config';
import { AuthorDetail, AuthorSearchResult, AuthorWorks } from '../types/api';
import apiClient from './client';

export interface SearchAuthorsParams {
    query: string;
    page?: number;
    limit?: number;
}

export interface GetAuthorWorksParams {
    authorKey: string;
    page?: number;
    limit?: number;
}

export const authorService = {
    /**
     * Search for authors by query
     */
    searchAuthors: async (params: SearchAuthorsParams): Promise<AuthorSearchResult> => {
        const { query, page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = params;

        const response = await apiClient.get<AuthorSearchResult>('/authors/search', {
            params: { query, page, limit },
        });

        return response.data;
    },

    /**
     * Get author details by author key
     */
    getAuthorDetail: async (authorKey: string): Promise<AuthorDetail> => {
        // Remove 'authors/' prefix if present
        const cleanKey = authorKey.replace('authors/', '').replace('/authors/', '');

        const response = await apiClient.get<AuthorDetail>(`/authors/${cleanKey}`);

        return response.data;
    },

    /**
     * Get author's works
     */
    getAuthorWorks: async (params: GetAuthorWorksParams): Promise<AuthorWorks> => {
        const { authorKey, page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = params;

        // Remove 'authors/' prefix if present
        const cleanKey = authorKey.replace('authors/', '').replace('/authors/', '');

        const response = await apiClient.get<AuthorWorks>(`/authors/${cleanKey}/works`, {
            params: { page, limit },
        });

        return response.data;
    },
};
