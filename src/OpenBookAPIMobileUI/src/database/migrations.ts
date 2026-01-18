import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

/**
 * Database migrations
 * Add new migrations here when schema changes
 * 
 * IMPORTANT: Never modify existing migrations, only add new ones
 * 
 * Example for future migration to version 2:
 * {
 *   toVersion: 2,
 *   steps: [
 *     addColumns({
 *       table: 'saved_books',
 *       columns: [
 *         { name: 'new_field', type: 'string', isOptional: true }
 *       ],
 *     }),
 *   ],
 * }
 */
export const migrations = schemaMigrations({
    migrations: [
        // Version 1 is the initial schema, no migrations needed yet
        // Future migrations will be added here
    ],
});
