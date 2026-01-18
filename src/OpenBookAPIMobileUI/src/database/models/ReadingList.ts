import { Model, Query } from '@nozbe/watermelondb';
import { children, date, field, readonly, text } from '@nozbe/watermelondb/decorators';
import type { Associations } from '@nozbe/watermelondb/Model';
import type { ListType, LocalSyncStatus } from '../../types/library.types';
import { TableNames } from '../schema';
import type ListBook from './ListBook';

/**
 * ReadingList model
 * Represents a user's book list (e.g., "Read", "Reading", "Will Read" or custom lists)
 */
export default class ReadingList extends Model {
    static table = TableNames.READING_LISTS;

    static associations: Associations = {
        [TableNames.LIST_BOOKS]: {
            type: 'has_many' as const,
            foreignKey: 'list_id',
        },
    };

    @text('name') name!: string;
    @text('list_type') listType!: ListType;
    @text('icon') icon!: string;
    @text('color') color!: string;
    @field('sort_order') sortOrder!: number;
    @readonly @date('created_at') createdAt!: Date;
    @date('updated_at') updatedAt!: Date;
    @text('local_sync_status') localSyncStatus!: LocalSyncStatus;
    @text('server_id') serverId!: string | null;

    // Relations
    @children(TableNames.LIST_BOOKS) listBooks!: Query<ListBook>;

    /**
     * Check if this is a system list (cannot be deleted)
     */
    get isSystemList(): boolean {
        return this.listType === 'system';
    }

    /**
     * Update the list with new values
     */
    async updateList(updates: { name?: string; icon?: string; color?: string }) {
        await this.update(list => {
            if (updates.name !== undefined) list.name = updates.name;
            if (updates.icon !== undefined) list.icon = updates.icon;
            if (updates.color !== undefined) list.color = updates.color;
            list.localSyncStatus = 'pending';
        });
    }

    /**
     * Mark as synced with server
     */
    async markSynced(serverId: string) {
        await this.update(list => {
            list.localSyncStatus = 'synced';
            list.serverId = serverId;
        });
    }
}
