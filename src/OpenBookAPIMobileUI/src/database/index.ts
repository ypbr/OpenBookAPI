import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { migrations } from './migrations';
import { ListBook, ReadingList, SavedBook } from './models';
import { schema } from './schema';

/**
 * SQLite adapter configuration for WatermelonDB
 */
const adapter = new SQLiteAdapter({
    schema,
    migrations,
    dbName: 'openbookapi_library',
    // Disable JSI for better compatibility (can enable later for performance)
    jsi: false,
    // Log database operations in development
    onSetUpError: error => {
        console.error('Database setup error:', error);
    },
});

/**
 * Database instance
 * This is the main entry point for all database operations
 */
export const database = new Database({
    adapter,
    modelClasses: [ReadingList, SavedBook, ListBook],
});

// Export collections for easy access
export const readingListsCollection = database.get<ReadingList>('reading_lists');
export const savedBooksCollection = database.get<SavedBook>('saved_books');
export const listBooksCollection = database.get<ListBook>('list_books');

// Re-export models and types
export * from './schema';
export { ListBook, ReadingList, SavedBook };

