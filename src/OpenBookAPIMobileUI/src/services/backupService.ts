import { Q } from '@nozbe/watermelondb';
import {
    database,
    listBooksCollection,
    ReadingList,
    readingListsCollection,
    SavedBook,
    savedBooksCollection,
} from '../database';
import type { LibraryExportData } from '../types/library.types';

const EXPORT_VERSION = 1;

/**
 * Backup Service
 * Provides JSON export/import functionality for library data
 */
export const backupService = {
    /**
     * Export entire library to JSON
     * Returns a JSON string that can be saved to file
     */
    async exportLibrary(): Promise<string> {
        try {
            // Fetch all data
            const lists = await readingListsCollection.query().fetch();
            const books = await savedBooksCollection.query().fetch();
            const listBooks = await listBooksCollection.query().fetch();

            // Convert to plain objects
            const exportData: LibraryExportData = {
                version: EXPORT_VERSION,
                exportedAt: Date.now(),
                lists: lists.map(list => ({
                    id: list.id,
                    name: list.name,
                    listType: list.listType,
                    icon: list.icon,
                    color: list.color,
                    sortOrder: list.sortOrder,
                    createdAt: list.createdAt.getTime(),
                    updatedAt: list.updatedAt.getTime(),
                    localSyncStatus: list.localSyncStatus,
                    serverId: list.serverId,
                })),
                books: books.map(book => ({
                    id: book.id,
                    workKey: book.workKey,
                    title: book.title,
                    authorNames: JSON.stringify(book.authorNames),
                    coverUrl: book.coverUrl,
                    firstPublishYear: book.firstPublishYear,
                    userRating: book.userRating,
                    notes: book.notes,
                    readingProgress: book.readingProgress,
                    createdAt: book.createdAt.getTime(),
                    updatedAt: book.updatedAt.getTime(),
                    localSyncStatus: book.localSyncStatus,
                    serverId: book.serverId,
                })),
                listBooks: listBooks.map(lb => ({
                    id: lb.id,
                    listId: lb.listId,
                    bookId: lb.bookId,
                    addedAt: lb.addedAt.getTime(),
                    sortOrder: lb.sortOrder,
                    updatedAt: lb.updatedAt.getTime(),
                    localSyncStatus: lb.localSyncStatus,
                    serverId: lb.serverId,
                })),
            };

            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('Failed to export library:', error);
            throw new Error('Failed to export library');
        }
    },

    /**
     * Import library from JSON
     * @param jsonString - JSON string from export
     * @param mode - 'merge' (keep existing + add new) or 'replace' (delete all + import)
     */
    async importLibrary(
        jsonString: string,
        mode: 'merge' | 'replace' = 'merge'
    ): Promise<{ listsImported: number; booksImported: number }> {
        try {
            const data: LibraryExportData = JSON.parse(jsonString);

            // Validate version
            if (!data.version || data.version > EXPORT_VERSION) {
                throw new Error('Unsupported backup version');
            }

            // Validate structure
            if (!Array.isArray(data.lists) || !Array.isArray(data.books) || !Array.isArray(data.listBooks)) {
                throw new Error('Invalid backup format');
            }

            let listsImported = 0;
            let booksImported = 0;

            await database.write(async () => {
                // If replace mode, delete all existing data (except system lists)
                if (mode === 'replace') {
                    // Delete all list_books
                    const existingListBooks = await listBooksCollection.query().fetch();
                    for (const lb of existingListBooks) {
                        await lb.destroyPermanently();
                    }

                    // Delete all books
                    const existingBooks = await savedBooksCollection.query().fetch();
                    for (const book of existingBooks) {
                        await book.destroyPermanently();
                    }

                    // Delete custom lists only (keep system lists)
                    const existingLists = await readingListsCollection
                        .query(Q.where('list_type', 'custom'))
                        .fetch();
                    for (const list of existingLists) {
                        await list.destroyPermanently();
                    }
                }

                // Import lists (skip system lists if they already exist)
                for (const listData of data.lists) {
                    // Check if list exists
                    const existing = await readingListsCollection.query(Q.where('id', listData.id)).fetch();

                    if (existing.length > 0) {
                        // Update existing list if it's custom
                        if (existing[0].listType === 'custom') {
                            await existing[0].update((list: ReadingList) => {
                                list.name = listData.name;
                                list.icon = listData.icon;
                                list.color = listData.color;
                                list.sortOrder = listData.sortOrder;
                                list.localSyncStatus = 'pending';
                            });
                            listsImported++;;
                        }
                    } else {
                        // Create new list
                        await readingListsCollection.create(list => {
                            list._raw.id = listData.id;
                            list.name = listData.name;
                            list.listType = listData.listType;
                            list.icon = listData.icon;
                            list.color = listData.color;
                            list.sortOrder = listData.sortOrder;
                            list.localSyncStatus = 'pending';
                            list.serverId = null;
                        });
                        listsImported++;
                    }
                }

                // Create ID mapping for books (old ID -> new ID)
                const bookIdMap = new Map<string, string>();

                // Import books
                for (const bookData of data.books) {
                    // Check if book with same workKey exists
                    const existing = await savedBooksCollection
                        .query(Q.where('work_key', bookData.workKey))
                        .fetch();

                    if (existing.length > 0) {
                        // Book exists, map old ID to existing ID
                        bookIdMap.set(bookData.id, existing[0].id);

                        // Update if merge mode and we want to update user data
                        if (mode === 'merge') {
                            await existing[0].update((book: SavedBook) => {
                                // Only update user-specific fields, keep latest
                                if (bookData.userRating !== null && book.userRating === null) {
                                    book.userRating = bookData.userRating;
                                }
                                if (bookData.notes && !book.notes) {
                                    book.notes = bookData.notes;
                                }
                                if (bookData.readingProgress > book.readingProgress) {
                                    book.readingProgress = bookData.readingProgress;
                                }
                                book.localSyncStatus = 'pending';
                            });
                        }
                        booksImported++;
                    } else {
                        // Create new book
                        const newBook = await savedBooksCollection.create(book => {
                            book.workKey = bookData.workKey;
                            book.title = bookData.title;
                            (book._raw as Record<string, unknown>).author_names = bookData.authorNames;
                            book.coverUrl = bookData.coverUrl;
                            book.firstPublishYear = bookData.firstPublishYear;
                            book.userRating = bookData.userRating;
                            book.notes = bookData.notes;
                            book.readingProgress = bookData.readingProgress;
                            book.localSyncStatus = 'pending';
                            book.serverId = null;
                        });
                        bookIdMap.set(bookData.id, newBook.id);
                        booksImported++;
                    }
                }

                // Import list-book associations
                for (const lbData of data.listBooks) {
                    const newBookId = bookIdMap.get(lbData.bookId);
                    if (!newBookId) continue;

                    // Check if association already exists
                    const existing = await listBooksCollection
                        .query(
                            Q.and(
                                Q.where('list_id', lbData.listId),
                                Q.where('book_id', newBookId)
                            )
                        )
                        .fetch();

                    if (existing.length === 0) {
                        await listBooksCollection.create(lb => {
                            lb.listId = lbData.listId;
                            lb.bookId = newBookId;
                            lb.sortOrder = lbData.sortOrder;
                            lb.localSyncStatus = 'pending';
                            lb.serverId = null;
                        });
                    }
                }
            });

            return { listsImported, booksImported };
        } catch (error) {
            console.error('Failed to import library:', error);
            if (error instanceof SyntaxError) {
                throw new Error('Invalid JSON format');
            }
            throw error;
        }
    },

    /**
     * Get export filename with timestamp
     */
    getExportFilename(): string {
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0];
        return `openbook_library_${dateStr}.json`;
    },

    /**
     * Get library statistics
     */
    async getLibraryStats(): Promise<{
        totalLists: number;
        customLists: number;
        totalBooks: number;
        booksWithRating: number;
        booksWithNotes: number;
    }> {
        const lists = await readingListsCollection.query().fetch();
        const books = await savedBooksCollection.query().fetch();

        return {
            totalLists: lists.length,
            customLists: lists.filter(l => l.listType === 'custom').length,
            totalBooks: books.length,
            booksWithRating: books.filter(b => b.userRating !== null).length,
            booksWithNotes: books.filter(b => b.notes !== null && b.notes !== '').length,
        };
    },
};
