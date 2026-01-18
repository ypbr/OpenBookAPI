import { Model, Relation } from '@nozbe/watermelondb';
import { date, field, immutableRelation, readonly, text } from '@nozbe/watermelondb/decorators';
import type { Associations } from '@nozbe/watermelondb/Model';
import type { LocalSyncStatus } from '../../types/library.types';
import { TableNames } from '../schema';
import type ReadingList from './ReadingList';
import type SavedBook from './SavedBook';

/**
 * ListBook model (Junction table)
 * Many-to-many relationship between ReadingList and SavedBook
 * Allows a book to be in multiple lists
 */
export default class ListBook extends Model {
    static table = TableNames.LIST_BOOKS;

    static associations: Associations = {
        [TableNames.READING_LISTS]: {
            type: 'belongs_to' as const,
            key: 'list_id',
        },
        [TableNames.SAVED_BOOKS]: {
            type: 'belongs_to' as const,
            key: 'book_id',
        },
    };

    @text('list_id') listId!: string;
    @text('book_id') bookId!: string;
    @readonly @date('added_at') addedAt!: Date;
    @field('sort_order') sortOrder!: number;
    @date('updated_at') updatedAt!: Date;
    @text('local_sync_status') localSyncStatus!: LocalSyncStatus;
    @text('server_id') serverId!: string | null;

    // Relations
    @immutableRelation(TableNames.READING_LISTS, 'list_id') list!: Relation<ReadingList>;
    @immutableRelation(TableNames.SAVED_BOOKS, 'book_id') book!: Relation<SavedBook>;

    /**
     * Mark as synced with server
     */
    async markSynced(serverId: string) {
        await this.update(listBook => {
            listBook.localSyncStatus = 'synced';
            listBook.serverId = serverId;
        });
    }
}
