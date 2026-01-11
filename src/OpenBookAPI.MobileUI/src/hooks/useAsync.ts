import { useCallback, useState } from 'react';

interface UseAsyncState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

interface UseAsyncResult<T, P extends unknown[]> extends UseAsyncState<T> {
    execute: (...args: P) => Promise<T | null>;
    reset: () => void;
}

/**
 * Hook for handling async operations with loading and error states
 */
export function useAsync<T, P extends unknown[] = []>(
    asyncFunction: (...args: P) => Promise<T>,
): UseAsyncResult<T, P> {
    const [state, setState] = useState<UseAsyncState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const execute = useCallback(
        async (...args: P): Promise<T | null> => {
            setState(prev => ({ ...prev, loading: true, error: null }));

            try {
                const result = await asyncFunction(...args);
                setState({ data: result, loading: false, error: null });
                return result;
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setState({ data: null, loading: false, error });
                return null;
            }
        },
        [asyncFunction],
    );

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    return { ...state, execute, reset };
}
