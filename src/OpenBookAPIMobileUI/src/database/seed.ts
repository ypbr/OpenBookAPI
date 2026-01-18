import AsyncStorage from '@react-native-async-storage/async-storage';
import { SystemListId, type DefaultListConfig } from '../types/library.types';
import { database, readingListsCollection } from './index';

const SEED_INITIALIZED_KEY = '@openbookapi/seed_initialized';

/**
 * Default system lists configuration
 * These lists are created on first app launch and cannot be deleted
 */
export const DEFAULT_LISTS: DefaultListConfig[] = [
    {
        id: SystemListId.READING,
        name: 'Reading',
        icon: '📖',
        color: '#4CAF50', // Green
        sortOrder: 0,
    },
    {
        id: SystemListId.WILL_READ,
        name: 'Will Read',
        icon: '🔖',
        color: '#2196F3', // Blue
        sortOrder: 1,
    },
    {
        id: SystemListId.READ,
        name: 'Read',
        icon: '✅',
        color: '#9C27B0', // Purple
        sortOrder: 2,
    },
];

/**
 * Initialize default reading lists on first app launch
 * Uses AsyncStorage to track if initialization has been done
 */
export async function initializeDefaultLists(): Promise<boolean> {
    try {
        // Check if already initialized
        const isInitialized = await AsyncStorage.getItem(SEED_INITIALIZED_KEY);
        if (isInitialized === 'true') {
            console.log('Default lists already initialized');
            return false;
        }

        // Create default lists in a batch
        await database.write(async () => {
            for (const listConfig of DEFAULT_LISTS) {
                await readingListsCollection.create(list => {
                    list._raw.id = listConfig.id; // Use predefined ID for system lists
                    list.name = listConfig.name;
                    list.listType = 'system';
                    list.icon = listConfig.icon;
                    list.color = listConfig.color;
                    list.sortOrder = listConfig.sortOrder;
                    list.localSyncStatus = 'pending';
                    list.serverId = null;
                });
            }
        });

        // Mark as initialized
        await AsyncStorage.setItem(SEED_INITIALIZED_KEY, 'true');
        console.log('Default lists created successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize default lists:', error);
        throw error;
    }
}

/**
 * Reset seed state (for testing/development)
 */
export async function resetSeedState(): Promise<void> {
    await AsyncStorage.removeItem(SEED_INITIALIZED_KEY);
}

/**
 * Check if default lists have been initialized
 */
export async function isSeedInitialized(): Promise<boolean> {
    const isInitialized = await AsyncStorage.getItem(SEED_INITIALIZED_KEY);
    return isInitialized === 'true';
}
