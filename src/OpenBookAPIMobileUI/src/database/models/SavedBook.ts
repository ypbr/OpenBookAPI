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
    // Reading tracking fields
    @field('total_pages') totalPages!: number | null;
    @field('current_page') currentPage!: number | null;
    @date('reading_started_at') readingStartedAt!: Date | null;
    @date('reading_finished_at') readingFinishedAt!: Date | null;
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

    /**
     * Get calculated reading progress based on current page and total pages
     */
    get calculatedProgress(): number {
        if (!this.totalPages || this.totalPages <= 0) {
            return this.readingProgress;
        }
        if (!this.currentPage || this.currentPage <= 0) {
            return 0;
        }
        return Math.min(100, Math.round((this.currentPage / this.totalPages) * 100));
    }

    /**
     * Check if book has page tracking enabled
     */
    get hasPageTracking(): boolean {
        return this.totalPages !== null && this.totalPages > 0;
    }

    /**
     * Set total pages for the book
     */
    async setTotalPages(pages: number) {
        const validPages = Math.max(1, pages);
        await this.update(book => {
            book.totalPages = validPages;
            book.localSyncStatus = 'pending';
        });
    }

    /**
     * Update current reading page and auto-calculate progress
     */
    async setCurrentPage(page: number) {
        const validPage = Math.max(0, Math.min(page, this.totalPages || page));
        const progress = this.totalPages && this.totalPages > 0
            ? Math.min(100, Math.round((validPage / this.totalPages) * 100))
            : 0;

        await this.update(book => {
            book.currentPage = validPage;
            book.readingProgress = progress;
            book.localSyncStatus = 'pending';
        });
    }

    /**
     * Start reading the book (sets reading start timestamp)
     */
    async startReading() {
        await this.update(book => {
            book.readingStartedAt = new Date();
            book.localSyncStatus = 'pending';
        });
    }

    /**
     * Finish reading the book (sets reading finish timestamp and progress to 100%)
     */
    async finishReading() {
        await this.update(book => {
            book.readingFinishedAt = new Date();
            book.readingProgress = 100;
            if (book.totalPages && !book.currentPage) {
                book.currentPage = book.totalPages;
            }
            book.localSyncStatus = 'pending';
        });
    }
}
