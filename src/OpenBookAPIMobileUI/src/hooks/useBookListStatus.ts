import { Q } from '@nozbe/watermelondb';
import { useCallback, useEffect, useState } from 'react';
import { listBooksCollection, savedBooksCollection } from '../database';

interface UseBookListStatusResult {
    isInAnyList: boolean;
    listIds: string[];
    loading: boolean;
    error: Error | null;
    checkList: (listId: string) => boolean;
    refresh: () => void;
}

/**
 * Hook to check which lists a book belongs to
 * @param workKey - The OpenLibrary work key of the book
 */
export function useBookListStatus(workKey: string): UseBookListStatusResult {
    const [listIds, setListIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadStatus = useCallback(async () => {
        if (!workKey) {
            setListIds([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Find the book by workKey
            const books = await savedBooksCollection
                .query(Q.where('work_key', workKey))
                .fetch();

            if (books.length === 0) {
                setListIds([]);
                setLoading(false);
                return;
            }

            const bookId = books[0].id;

            // Observe list_books for this book
            const subscription = listBooksCollection
                .query(Q.where('book_id', bookId))
                .observe()
                .subscribe({
                    next: (listBooks) => {
                        const ids = listBooks.map((lb) => lb.listId);
                        setListIds(ids);
                        setLoading(false);
                    },
                    error: (err) => {
                        console.error('Error observing book list status:', err);
                        setError(err);
                        setLoading(false);
                    },
                });

            return subscription;
        } catch (err) {
            setError(err as Error);
            setLoading(false);
        }
    }, [workKey]);

    useEffect(() => {
        let subscription: { unsubscribe: () => void } | undefined;

        const init = async () => {
            subscription = await loadStatus();
        };

        init();

        return () => {
            subscription?.unsubscribe();
        };
    }, [loadStatus]);

    const checkList = useCallback(
        (listId: string) => {
            return listIds.includes(listId);
        },
        [listIds]
    );

    const refresh = useCallback(() => {
        loadStatus();
    }, [loadStatus]);

    return {
        isInAnyList: listIds.length > 0,
        listIds,
        loading,
        error,
        checkList,
        refresh,
    };
}
