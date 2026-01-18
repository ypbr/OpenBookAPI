import { Q } from '@nozbe/watermelondb';
import { useCallback, useEffect, useState } from 'react';
import { listBooksCollection, SavedBook, savedBooksCollection } from '../database';

interface UseBooksInListResult {
    books: SavedBook[];
    loading: boolean;
    error: Error | null;
    bookCount: number;
    refresh: () => void;
}

/**
 * Hook to observe books in a specific list
 * Automatically updates when books are added/removed
 */
export function useBooksInList(listId: string): UseBooksInListResult {
    const [books, setBooks] = useState<SavedBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadBooks = useCallback(async () => {
        if (!listId) {
            setBooks([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Observe list_books for this list
            const subscription = listBooksCollection
                .query(Q.where('list_id', listId), Q.sortBy('sort_order', Q.asc))
                .observe()
                .subscribe({
                    next: async (listBooks) => {
                        try {
                            // Fetch actual book records
                            const bookPromises = listBooks.map(async (lb) => {
                                try {
                                    return await savedBooksCollection.find(lb.bookId);
                                } catch {
                                    return null;
                                }
                            });

                            const fetchedBooks = await Promise.all(bookPromises);
                            const validBooks = fetchedBooks.filter((b: SavedBook | null): b is SavedBook => b !== null);
                            setBooks(validBooks);
                            setLoading(false);
                        } catch (err) {
                            console.error('Error fetching books:', err);
                            setError(err as Error);
                            setLoading(false);
                        }
                    },
                    error: (err) => {
                        console.error('Error observing list books:', err);
                        setError(err);
                        setLoading(false);
                    },
                });

            return subscription;
        } catch (err) {
            setError(err as Error);
            setLoading(false);
        }
    }, [listId]);

    useEffect(() => {
        let subscription: { unsubscribe: () => void } | undefined;

        const init = async () => {
            subscription = await loadBooks();
        };

        init();

        return () => {
            subscription?.unsubscribe();
        };
    }, [loadBooks]);

    const refresh = useCallback(() => {
        loadBooks();
    }, [loadBooks]);

    return { books, loading, error, bookCount: books.length, refresh };
}
