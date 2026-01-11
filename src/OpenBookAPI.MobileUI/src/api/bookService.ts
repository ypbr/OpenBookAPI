import { PAGINATION } from '../constants/config';
import { BookDetail, BookSearchResult } from '../types/api';
import apiClient from './client';

export interface SearchBooksParams {
    query: string;
    page?: number;
    limit?: number;
}

export interface GetBookByIsbnParams {
    isbn: string;
}

export const bookService = {
    /**
     * Search for books by query
     */
    searchBooks: async (params: SearchBooksParams): Promise<BookSearchResult> => {
        const { query, page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = params;

        const response = await apiClient.get<BookSearchResult>('/books/search', {
            params: { query, page, limit },
        });

        return response.data;
    },

    /**
     * Get book details by work key
     */
    getBookDetail: async (workKey: string): Promise<BookDetail> => {
        // Remove 'works/' prefix if present
        const cleanKey = workKey.replace('works/', '').replace('/works/', '');

        const response = await apiClient.get<BookDetail>(`/books/${cleanKey}`);

        return response.data;
    },

    /**
     * Get book by ISBN
     */
    getBookByIsbn: async (isbn: string): Promise<BookDetail> => {
        const response = await apiClient.get<BookDetail>(`/books/isbn/${isbn}`);

        return response.data;
    },
};
