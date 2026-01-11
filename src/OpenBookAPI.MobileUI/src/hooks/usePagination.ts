import { useCallback, useState } from 'react';
import { PAGINATION } from '../constants/config';

interface PaginationState {
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

interface UsePaginationResult extends PaginationState {
    setPage: (page: number) => void;
    nextPage: () => void;
    previousPage: () => void;
    setTotalResults: (total: number) => void;
    reset: () => void;
}

/**
 * Hook for managing pagination state
 */
export function usePagination(
    initialLimit: number = PAGINATION.DEFAULT_LIMIT,
): UsePaginationResult {
    const [state, setState] = useState<PaginationState>({
        page: PAGINATION.DEFAULT_PAGE,
        limit: initialLimit,
        totalPages: 0,
        totalResults: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    });

    const setPage = useCallback((page: number) => {
        setState(prev => {
            const newPage = Math.max(1, Math.min(page, prev.totalPages || 1));
            return {
                ...prev,
                page: newPage,
                hasNextPage: newPage < prev.totalPages,
                hasPreviousPage: newPage > 1,
            };
        });
    }, []);

    const nextPage = useCallback(() => {
        setState(prev => {
            if (!prev.hasNextPage) return prev;
            const newPage = prev.page + 1;
            return {
                ...prev,
                page: newPage,
                hasNextPage: newPage < prev.totalPages,
                hasPreviousPage: true,
            };
        });
    }, []);

    const previousPage = useCallback(() => {
        setState(prev => {
            if (!prev.hasPreviousPage) return prev;
            const newPage = prev.page - 1;
            return {
                ...prev,
                page: newPage,
                hasNextPage: true,
                hasPreviousPage: newPage > 1,
            };
        });
    }, []);

    const setTotalResults = useCallback((total: number) => {
        setState(prev => {
            const totalPages = Math.ceil(total / prev.limit);
            return {
                ...prev,
                totalResults: total,
                totalPages,
                hasNextPage: prev.page < totalPages,
                hasPreviousPage: prev.page > 1,
            };
        });
    }, []);

    const reset = useCallback(() => {
        setState({
            page: PAGINATION.DEFAULT_PAGE,
            limit: initialLimit,
            totalPages: 0,
            totalResults: 0,
            hasNextPage: false,
            hasPreviousPage: false,
        });
    }, [initialLimit]);

    return {
        ...state,
        setPage,
        nextPage,
        previousPage,
        setTotalResults,
        reset,
    };
}
