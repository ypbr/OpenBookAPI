import { Q } from '@nozbe/watermelondb';
import {
    database,
    ListBook,
    listBooksCollection,
    ReadingList,
    readingListsCollection,
    SavedBook,
    savedBooksCollection,
} from '../database';
import { SystemListId } from '../types/library.types';

/**
 * Book data input for saving to library
 * This normalizes the different API response formats
 */
export interface BookInput {
    workKey: string;
    title: string;
    authorNames?: string[];
    coverUrl?: string;
    firstPublishYear?: number;
}

/**
 * Library Service
 * Provides CRUD operations for reading lists and saved books
 */
export const libraryService = {
    // ==================== READING LISTS ====================

    /**
     * Get all reading lists ordered by sortOrder
     */
    async getAllLists(): Promise<ReadingList[]> {
        return readingListsCollection.query(Q.sortBy('sort_order', Q.asc)).fetch();
    },

    /**
     * Get a single list by ID
     */
    async getListById(listId: string): Promise<ReadingList | null> {
        try {
            return await readingListsCollection.find(listId);
        } catch {
            return null;
        }
    },

    /**
     * Create a new custom reading list
     */
    async createList(name: string, icon: string = 'folder', color: string = '#607D8B'): Promise<ReadingList> {
        const lists = await this.getAllLists();
        const maxSortOrder = lists.length > 0 ? Math.max(...lists.map(l => l.sortOrder)) : -1;

        return database.write(async () => {
            return readingListsCollection.create(list => {
                list.name = name;
                list.listType = 'custom';
                list.icon = icon;
                list.color = color;
                list.sortOrder = maxSortOrder + 1;
                list.localSyncStatus = 'pending';
                list.serverId = null;
            });
        });
    },

    /**
     * Update a reading list
     */
    async updateList(
        listId: string,
        updates: { name?: string; icon?: string; color?: string }
    ): Promise<void> {
        const list = await readingListsCollection.find(listId);
        await database.write(async () => {
            await list.update((l: ReadingList) => {
                if (updates.name !== undefined) l.name = updates.name;
                if (updates.icon !== undefined) l.icon = updates.icon;
                if (updates.color !== undefined) l.color = updates.color;
                l.localSyncStatus = 'pending';
            });
        });
    },

    /**
     * Delete a custom reading list (system lists cannot be deleted)
     */
    async deleteList(listId: string): Promise<boolean> {
        const list = await readingListsCollection.find(listId);
        if (list.isSystemList) {
            throw new Error('System lists cannot be deleted');
        }

        await database.write(async () => {
            // First, delete all list-book associations
            const listBooks = await listBooksCollection.query(Q.where('list_id', listId)).fetch();
            for (const lb of listBooks) {
                await lb.destroyPermanently();
            }
            // Then delete the list
            await list.destroyPermanently();
        });

        return true;
    },

    // ==================== SAVED BOOKS ====================

    /**
     * Get a saved book by work key
     */
    async getBookByWorkKey(workKey: string): Promise<SavedBook | null> {
        const books = await savedBooksCollection.query(Q.where('work_key', workKey)).fetch();
        return books.length > 0 ? books[0] : null;
    },

    /**
     * Get a saved book by ID
     */
    async getBookById(bookId: string): Promise<SavedBook | null> {
        try {
            return await savedBooksCollection.find(bookId);
        } catch {
            return null;
        }
    },

    /**
     * Save a book from API response (BookSummary or BookDetail)
     * If book already exists, returns existing book
     */
    async saveBook(bookData: BookInput): Promise<SavedBook> {
        // Check if book already exists
        const existingBook = await this.getBookByWorkKey(bookData.workKey);
        if (existingBook) {
            return existingBook;
        }

        // Create new book
        return database.write(async () => {
            return savedBooksCollection.create(book => {
                book.workKey = bookData.workKey;
                book.title = bookData.title;
                (book._raw as Record<string, unknown>).author_names = JSON.stringify(bookData.authorNames || []);
                book.coverUrl = bookData.coverUrl || null;
                book.firstPublishYear = bookData.firstPublishYear ?? null;
                book.userRating = null;
                book.notes = null;
                book.readingProgress = 0;
                book.localSyncStatus = 'pending';
                book.serverId = null;
            });
        });
    },

    /**
     * Delete a saved book and all its list associations
     */
    async deleteBook(bookId: string): Promise<void> {
        await database.write(async () => {
            // Delete all list-book associations
            const listBooks = await listBooksCollection.query(Q.where('book_id', bookId)).fetch();
            for (const lb of listBooks) {
                await lb.destroyPermanently();
            }
            // Delete the book
            const book = await savedBooksCollection.find(bookId);
            await book.destroyPermanently();
        });
    },

    /**
     * Update book rating
     */
    async setBookRating(bookId: string, rating: number): Promise<void> {
        const validRating = Math.max(0, Math.min(5, rating));
        await database.write(async () => {
            const book = await savedBooksCollection.find(bookId);
            await book.update((b: SavedBook) => {
                b.userRating = validRating;
                b.localSyncStatus = 'pending';
            });
        });
    },

    /**
     * Update book reading progress (0-100)
     */
    async setBookProgress(bookId: string, progress: number): Promise<void> {
        const validProgress = Math.max(0, Math.min(100, progress));
        await database.write(async () => {
            const book = await savedBooksCollection.find(bookId);
            await book.update((b: SavedBook) => {
                b.readingProgress = validProgress;
                b.localSyncStatus = 'pending';
            });
        });
    },

    /**
     * Update book notes
     */
    async setBookNotes(bookId: string, notes: string): Promise<void> {
        await database.write(async () => {
            const book = await savedBooksCollection.find(bookId);
            await book.update((b: SavedBook) => {
                b.notes = notes;
                b.localSyncStatus = 'pending';
            });
        });
    },

    // ==================== LIST-BOOK ASSOCIATIONS ====================

    /**
     * Add a book to a list
     * If book doesn't exist, it will be created first
     */
    async addBookToList(
        bookData: BookInput,
        listId: string
    ): Promise<{ book: SavedBook; listBook: ListBook }> {
        // Ensure book exists
        const book = await this.saveBook(bookData);

        // Check if association already exists
        const existingAssoc = await listBooksCollection
            .query(Q.and(Q.where('list_id', listId), Q.where('book_id', book.id)))
            .fetch();

        if (existingAssoc.length > 0) {
            return { book, listBook: existingAssoc[0] };
        }

        // Get max sort order in this list
        const listBooks = await listBooksCollection.query(Q.where('list_id', listId)).fetch();
        const maxSortOrder = listBooks.length > 0 ? Math.max(...listBooks.map(lb => lb.sortOrder)) : -1;

        // Create association
        const listBook = await database.write(async () => {
            return listBooksCollection.create(lb => {
                lb.listId = listId;
                lb.bookId = book.id;
                lb.sortOrder = maxSortOrder + 1;
                lb.localSyncStatus = 'pending';
                lb.serverId = null;
            });
        });

        return { book, listBook };
    },

    /**
     * Remove a book from a list
     */
    async removeBookFromList(bookId: string, listId: string): Promise<void> {
        await database.write(async () => {
            const associations = await listBooksCollection
                .query(Q.and(Q.where('list_id', listId), Q.where('book_id', bookId)))
                .fetch();

            for (const assoc of associations) {
                await assoc.destroyPermanently();
            }
        });

        // Check if book is in any other list, if not, optionally delete the book
        const remainingAssocs = await listBooksCollection.query(Q.where('book_id', bookId)).fetch();
        if (remainingAssocs.length === 0) {
            // Book is not in any list, keep it for now (user might want to add it to another list)
            // If you want to auto-delete orphan books, uncomment the following:
            // await this.deleteBook(bookId);
        }
    },

    /**
     * Get all books in a specific list
     */
    async getBooksInList(listId: string): Promise<SavedBook[]> {
        const listBooks = await listBooksCollection
            .query(Q.where('list_id', listId), Q.sortBy('sort_order', Q.asc))
            .fetch();

        const books: SavedBook[] = [];
        for (const lb of listBooks) {
            const book = await lb.book.fetch();
            if (book) {
                books.push(book);
            }
        }
        return books;
    },

    /**
     * Get all lists that contain a specific book
     */
    async getListsForBook(bookId: string): Promise<ReadingList[]> {
        const listBooks = await listBooksCollection.query(Q.where('book_id', bookId)).fetch();

        const lists: ReadingList[] = [];
        for (const lb of listBooks) {
            const list = await lb.list.fetch();
            if (list) {
                lists.push(list);
            }
        }
        return lists;
    },

    /**
     * Check if a book is in a specific list
     */
    async isBookInList(workKey: string, listId: string): Promise<boolean> {
        const book = await this.getBookByWorkKey(workKey);
        if (!book) return false;

        const associations = await listBooksCollection
            .query(Q.and(Q.where('list_id', listId), Q.where('book_id', book.id)))
            .fetch();

        return associations.length > 0;
    },

    /**
     * Get book count for a list
     */
    async getBookCountInList(listId: string): Promise<number> {
        return listBooksCollection.query(Q.where('list_id', listId)).fetchCount();
    },

    /**
     * Toggle book in list (add if not present, remove if present)
     */
    async toggleBookInList(bookData: BookInput, listId: string): Promise<boolean> {
        const book = await this.getBookByWorkKey(bookData.workKey);

        if (book) {
            const isInList = await this.isBookInList(bookData.workKey, listId);
            if (isInList) {
                await this.removeBookFromList(book.id, listId);
                return false; // Removed
            }
        }

        await this.addBookToList(bookData, listId);
        return true; // Added
    },

    // ==================== UTILITY ====================

    /**
     * Get total saved books count
     */
    async getTotalBooksCount(): Promise<number> {
        return savedBooksCollection.query().fetchCount();
    },

    /**
     * Get all saved books
     */
    async getAllBooks(): Promise<SavedBook[]> {
        return savedBooksCollection.query(Q.sortBy('created_at', Q.desc)).fetch();
    },

    // ==================== READING PROGRESS ====================

    /**
     * Set total pages and current page for a book
     */
    async setBookPages(bookId: string, totalPages: number, currentPage: number = 0): Promise<void> {
        const validTotalPages = Math.max(1, totalPages);
        const validCurrentPage = Math.max(0, Math.min(currentPage, validTotalPages));
        const progress = validTotalPages > 0
            ? Math.min(100, Math.round((validCurrentPage / validTotalPages) * 100))
            : 0;

        await database.write(async () => {
            const book = await savedBooksCollection.find(bookId);
            await book.update((b: SavedBook) => {
                b.totalPages = validTotalPages;
                b.currentPage = validCurrentPage;
                b.readingProgress = progress;
                b.localSyncStatus = 'pending';
            });
        });
    },

    /**
     * Update current reading page
     */
    async updateCurrentPage(bookId: string, currentPage: number): Promise<void> {
        const book = await savedBooksCollection.find(bookId);
        const totalPages = book.totalPages || 0;
        const validCurrentPage = Math.max(0, Math.min(currentPage, totalPages));
        const progress = totalPages > 0
            ? Math.min(100, Math.round((validCurrentPage / totalPages) * 100))
            : 0;

        await database.write(async () => {
            await book.update((b: SavedBook) => {
                b.currentPage = validCurrentPage;
                b.readingProgress = progress;
                b.localSyncStatus = 'pending';
            });
        });
    },

    /**
     * Start reading a book (sets reading start timestamp)
     */
    async startReading(bookId: string): Promise<void> {
        await database.write(async () => {
            const book = await savedBooksCollection.find(bookId);
            await book.update((b: SavedBook) => {
                (b._raw as Record<string, unknown>).reading_started_at = Date.now();
                b.localSyncStatus = 'pending';
            });
        });
    },

    /**
     * Finish reading a book (sets finish timestamp, moves to "Read" list)
     */
    async finishReading(bookId: string): Promise<void> {
        await database.write(async () => {
            const book = await savedBooksCollection.find(bookId);
            await book.update((b: SavedBook) => {
                (b._raw as Record<string, unknown>).reading_finished_at = Date.now();
                b.readingProgress = 100;
                if (b.totalPages && !b.currentPage) {
                    b.currentPage = b.totalPages;
                }
                b.localSyncStatus = 'pending';
            });
        });

        // Move book from "Reading" to "Read" list
        try {
            // Remove from "Reading" list
            await this.removeBookFromList(bookId, SystemListId.READING);

            // Add to "Read" list
            const book = await savedBooksCollection.find(bookId);
            const bookData = {
                workKey: book.workKey,
                title: book.title,
                authorNames: book.authorNames,
                coverUrl: book.coverUrl || undefined,
                firstPublishYear: book.firstPublishYear ?? undefined,
            };
            await this.addBookToList(bookData, SystemListId.READ);
        } catch (err) {
            console.error('Error moving book to Read list:', err);
        }
    },

    /**
     * Check if a book is in the "Reading" list
     */
    async isBookInReadingList(workKey: string): Promise<boolean> {
        return this.isBookInList(workKey, SystemListId.READING);
    },
};
