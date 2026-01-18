import { Q } from '@nozbe/watermelondb';
import { useCallback, useEffect, useState } from 'react';
import { ReadingList, readingListsCollection } from '../database';

interface UseReadingListsResult {
    lists: ReadingList[];
    loading: boolean;
    error: Error | null;
    refresh: () => void;
}

/**
 * Hook to observe all reading lists
 * Automatically updates when lists change
 */
export function useReadingLists(): UseReadingListsResult {
    const [lists, setLists] = useState<ReadingList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadLists = useCallback(() => {
        setLoading(true);
        setError(null);

        const subscription = readingListsCollection
            .query(Q.sortBy('sort_order', Q.asc))
            .observe()
            .subscribe({
                next: (readingLists) => {
                    setLists(readingLists);
                    setLoading(false);
                },
                error: (err) => {
                    console.error('Error observing reading lists:', err);
                    setError(err);
                    setLoading(false);
                },
            });

        return subscription;
    }, []);

    useEffect(() => {
        const subscription = loadLists();
        return () => {
            subscription.unsubscribe();
        };
    }, [loadLists]);

    const refresh = useCallback(() => {
        loadLists();
    }, [loadLists]);

    return { lists, loading, error, refresh };
}
