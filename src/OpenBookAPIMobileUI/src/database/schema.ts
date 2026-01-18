import { appSchema, tableSchema } from '@nozbe/watermelondb';

/**
 * Database schema version 1
 * Tables: reading_lists, saved_books, list_books (junction)
 */
export const schema = appSchema({
    version: 1,
    tables: [
        /**
         * Reading Lists table
         * Stores user's book lists (system + custom)
         */
        tableSchema({
            name: 'reading_lists',
            columns: [
                { name: 'name', type: 'string' },
                { name: 'list_type', type: 'string' }, // 'system' | 'custom'
                { name: 'icon', type: 'string' },
                { name: 'color', type: 'string' },
                { name: 'sort_order', type: 'number' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                // Sync fields
                { name: 'local_sync_status', type: 'string' }, // 'pending' | 'synced' | 'conflict'
                { name: 'server_id', type: 'string', isOptional: true },
            ],
        }),

        /**
         * Saved Books table
         * Stores cached book data from OpenLibrary for offline access
         */
        tableSchema({
            name: 'saved_books',
            columns: [
                { name: 'work_key', type: 'string', isIndexed: true },
                { name: 'title', type: 'string' },
                { name: 'author_names', type: 'string' }, // JSON stringified array
                { name: 'cover_url', type: 'string', isOptional: true },
                { name: 'first_publish_year', type: 'number', isOptional: true },
                { name: 'user_rating', type: 'number', isOptional: true }, // 0-5
                { name: 'notes', type: 'string', isOptional: true },
                { name: 'reading_progress', type: 'number' }, // 0-100
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
                // Sync fields
                { name: 'local_sync_status', type: 'string' },
                { name: 'server_id', type: 'string', isOptional: true },
            ],
        }),

        /**
         * List Books junction table
         * Many-to-many relationship between lists and books
         */
        tableSchema({
            name: 'list_books',
            columns: [
                { name: 'list_id', type: 'string', isIndexed: true },
                { name: 'book_id', type: 'string', isIndexed: true },
                { name: 'added_at', type: 'number' },
                { name: 'sort_order', type: 'number' },
                { name: 'updated_at', type: 'number' },
                // Sync fields
                { name: 'local_sync_status', type: 'string' },
                { name: 'server_id', type: 'string', isOptional: true },
            ],
        }),
    ],
});

// Table names as constants for type safety
export const TableNames = {
    READING_LISTS: 'reading_lists',
    SAVED_BOOKS: 'saved_books',
    LIST_BOOKS: 'list_books',
} as const;

export type TableName = (typeof TableNames)[keyof typeof TableNames];
