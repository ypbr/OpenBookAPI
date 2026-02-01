// Library Types for Local Book Storage

/**
 * Sync status for local records
 * - pending: Not synced to server yet
 * - synced: Successfully synced
 * - conflict: Sync conflict detected (Last-Write-Wins will resolve)
 */
export type LocalSyncStatus = 'pending' | 'synced' | 'conflict';

/**
 * Reading list type
 * - system: Default lists (Read, Reading, Will Read) - cannot be deleted
 * - custom: User-created lists
 */
export type ListType = 'system' | 'custom';

/**
 * Default system list identifiers
 */
export enum SystemListId {
    READ = 'system_read',
    READING = 'system_reading',
    WILL_READ = 'system_will_read',
}

/**
 * Reading list interface for TypeScript usage
 */
export interface IReadingList {
    id: string;
    name: string;
    listType: ListType;
    icon: string;
    color: string;
    sortOrder: number;
    createdAt: number;
    updatedAt: number;
    localSyncStatus: LocalSyncStatus;
    serverId: string | null;
}

/**
 * Saved book interface for TypeScript usage
 * Contains cached book data from OpenLibrary for offline access
 */
export interface ISavedBook {
    id: string;
    workKey: string;
    title: string;
    authorNames: string;
    coverUrl: string | null;
    firstPublishYear: number | null;
    userRating: number | null;
    notes: string | null;
    readingProgress: number;
    // Reading tracking fields
    totalPages: number | null;
    currentPage: number | null;
    readingStartedAt: number | null;
    readingFinishedAt: number | null;
    createdAt: number;
    updatedAt: number;
    localSyncStatus: LocalSyncStatus;
    serverId: string | null;
}

/**
 * Junction table for many-to-many relationship between lists and books
 */
export interface IListBook {
    id: string;
    listId: string;
    bookId: string;
    addedAt: number;
    sortOrder: number;
    updatedAt: number;
    localSyncStatus: LocalSyncStatus;
    serverId: string | null;
}

/**
 * Default list configuration for seeding
 */
export interface DefaultListConfig {
    id: SystemListId;
    name: string;
    icon: string;
    color: string;
    sortOrder: number;
}

/**
 * Export/Import data structure for JSON backup
 */
export interface LibraryExportData {
    version: number;
    exportedAt: number;
    lists: IReadingList[];
    books: ISavedBook[];
    listBooks: IListBook[];
}

/**
 * Book with its list associations for UI display
 */
export interface BookWithLists extends ISavedBook {
    lists: IReadingList[];
}

/**
 * List with book count for UI display
 */
export interface ListWithCount extends IReadingList {
    bookCount: number;
}
