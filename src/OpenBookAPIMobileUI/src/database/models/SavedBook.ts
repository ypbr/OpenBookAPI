import { Model, Query } from '@nozbe/watermelondb';
import { children, date, field, json, readonly, text } from '@nozbe/watermelondb/decorators';
import type { Associations } from '@nozbe/watermelondb/Model';
import type { LocalSyncStatus } from '../../types/library.types';
import { TableNames } from '../schema';
import type ListBook from './ListBook';

// Helper to parse JSON arrays safely
const sanitizeAuthorNames = (raw: unknown): string[] => {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return raw ? [raw] : [];
        }
    }
    return [];
};

/**
 * SavedBook model
 * Stores cached book data from OpenLibrary for offline access
 */
export default class SavedBook extends Model {
    static table = TableNames.SAVED_BOOKS;

    static associations: Associations = {
        [TableNames.LIST_BOOKS]: {
            type: 'has_many' as const,
            foreignKey: 'book_id',
        },
    };

    @text('work_key') workKey!: string;
    @text('title') title!: string;
    @json('author_names', sanitizeAuthorNames) authorNames!: string[];
    @text('cover_url') coverUrl!: string | null;
    @field('first_publish_year') firstPublishYear!: number | null;
    @field('user_rating') userRating!: number | null;
    @text('notes') notes!: string | null;
    @field('reading_progress') readingProgress!: number;
    @readonly @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @text('local_sync_status') localSyncStatus!: LocalSyncStatus;
    @text('server_id') serverId!: string | null;

    // Relations
    @children(TableNames.LIST_BOOKS) listBooks!: Query<ListBook>;

    /**
     * Get author names as a formatted string
     */
    get authorNamesFormatted(): string {
        return this.authorNames.join(', ');
    }

    /**
     * Update user rating (0-5)
     */
    async setRating(rating: number) {
        const validRating = Math.max(0, Math.min(5, rating));
        await this.update(book => {
            book.userRating = validRating;
            book.localSyncStatus = 'pending';
        });
    }

    /**
     * Update reading progress (0-100)
     */
    async setProgress(progress: number) {
        const validProgress = Math.max(0, Math.min(100, progress));
        await this.update(book => {
            book.readingProgress = validProgress;
            book.localSyncStatus = 'pending';
        });
    }

    /**
     * Update notes
     */
    async setNotes(notes: string) {
        await this.update(book => {
            book.notes = notes;
            book.localSyncStatus = 'pending';
        });
    }

    /**
     * Mark as synced with server
     */
    async markSynced(serverId: string) {
        await this.update(book => {
            book.localSyncStatus = 'synced';
            book.serverId = serverId;
        });
    }
}
