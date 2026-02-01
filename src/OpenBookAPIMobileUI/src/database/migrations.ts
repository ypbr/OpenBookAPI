import { addColumns, schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

/**
 * Database migrations
 * Add new migrations here when schema changes
 * 
 * IMPORTANT: Never modify existing migrations, only add new ones
 */
export const migrations = schemaMigrations({
    migrations: [
        // Migration to version 2: Add reading progress tracking fields
        {
            toVersion: 2,
            steps: [
                addColumns({
                    table: 'saved_books',
                    columns: [
                        { name: 'total_pages', type: 'number', isOptional: true },
                        { name: 'current_page', type: 'number', isOptional: true },
                        { name: 'reading_started_at', type: 'number', isOptional: true },
                        { name: 'reading_finished_at', type: 'number', isOptional: true },
                    ],
                }),
            ],
        },
    ],
});
