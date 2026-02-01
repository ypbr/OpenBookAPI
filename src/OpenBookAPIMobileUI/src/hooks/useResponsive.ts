import { useWindowDimensions } from 'react-native';

/**
 * Device size breakpoints based on Android Material Design guidelines
 * - compact: < 600dp (phones)
 * - medium: 600-840dp (small tablets, large phones in landscape)
 * - expanded: > 840dp (tablets)
 */
const BREAKPOINTS = {
    COMPACT: 600,
    MEDIUM: 840,
} as const;

/**
 * Minimum card widths to ensure readability
 */
const MIN_CARD_WIDTH = {
    BOOK: 110,
    LIST: 140,
    AUTHOR: 200,
} as const;

/**
 * Grid padding and gap configuration
 */
const GRID_CONFIG = {
    HORIZONTAL_PADDING: 16,
    GAP: 16,
} as const;

export type DeviceType = 'phone' | 'tablet';
export type Orientation = 'portrait' | 'landscape';
export type WindowSize = 'compact' | 'medium' | 'expanded';

export interface ResponsiveConfig {
    // Screen dimensions
    width: number;
    height: number;

    // Device info
    deviceType: DeviceType;
    orientation: Orientation;
    windowSize: WindowSize;

    // Book grid configuration
    bookColumns: number;
    bookCardWidth: number;

    // List grid configuration
    listColumns: number;
    listCardWidth: number;

    // Author grid configuration
    authorColumns: number;
    authorCardWidth: number;
    authorAvatarSize: number;

    // List detail item configuration
    listDetailImageWidth: number;
    listDetailImageHeight: number;

    // Font scaling for tablets
    fontScale: number;
}

/**
 * Calculate number of columns based on available width and minimum card width
 */
const calculateColumns = (
    availableWidth: number,
    minCardWidth: number,
    gap: number,
): number => {
    // Formula: (availableWidth + gap) / (minCardWidth + gap)
    const columns = Math.floor((availableWidth + gap) / (minCardWidth + gap));
    return Math.max(1, columns);
};

/**
 * Calculate card width based on number of columns
 */
const calculateCardWidth = (
    availableWidth: number,
    columns: number,
    gap: number,
): number => {
    // Total gap space between cards = (columns - 1) * gap
    const totalGapSpace = (columns - 1) * gap;
    const cardWidth = (availableWidth - totalGapSpace) / columns;
    return Math.floor(cardWidth);
};

/**
 * Custom hook for responsive layout calculations
 * Automatically updates when screen dimensions change (orientation, window resize)
 */
export const useResponsive = (): ResponsiveConfig => {
    const { width, height } = useWindowDimensions();

    // Determine orientation
    const orientation: Orientation = width > height ? 'landscape' : 'portrait';

    // Determine window size class based on width
    const windowSize: WindowSize =
        width < BREAKPOINTS.COMPACT
            ? 'compact'
            : width < BREAKPOINTS.MEDIUM
                ? 'medium'
                : 'expanded';

    // Determine device type (use shorter dimension to avoid orientation affecting device detection)
    const shortestDimension = Math.min(width, height);
    const deviceType: DeviceType =
        shortestDimension >= BREAKPOINTS.COMPACT ? 'tablet' : 'phone';

    // Available width for grid (screen width - horizontal padding on both sides)
    const availableWidth = width - GRID_CONFIG.HORIZONTAL_PADDING * 2;

    // ========== BOOK GRID CONFIGURATION ==========
    // Phone portrait: 2, Phone landscape: 4
    // Tablet portrait: 4-5, Tablet landscape: 7-8
    let bookColumns: number;
    if (deviceType === 'phone') {
        bookColumns = orientation === 'portrait' ? 2 : 4;
    } else {
        // Tablet - calculate based on available width
        bookColumns = calculateColumns(
            availableWidth,
            MIN_CARD_WIDTH.BOOK,
            GRID_CONFIG.GAP,
        );
        // Clamp to reasonable range
        if (orientation === 'portrait') {
            bookColumns = Math.min(Math.max(bookColumns, 3), 5);
        } else {
            bookColumns = Math.min(Math.max(bookColumns, 5), 8);
        }
    }
    const bookCardWidth = calculateCardWidth(
        availableWidth,
        bookColumns,
        GRID_CONFIG.GAP,
    );

    // ========== LIST GRID CONFIGURATION ==========
    // Phone portrait: 2, Phone landscape: 3
    // Tablet portrait: 3-4, Tablet landscape: 5-6
    let listColumns: number;
    if (deviceType === 'phone') {
        listColumns = orientation === 'portrait' ? 2 : 3;
    } else {
        listColumns = calculateColumns(
            availableWidth,
            MIN_CARD_WIDTH.LIST,
            GRID_CONFIG.GAP,
        );
        if (orientation === 'portrait') {
            listColumns = Math.min(Math.max(listColumns, 3), 4);
        } else {
            listColumns = Math.min(Math.max(listColumns, 4), 6);
        }
    }
    const listCardWidth = calculateCardWidth(
        availableWidth,
        listColumns,
        GRID_CONFIG.GAP,
    );

    // ========== AUTHOR GRID CONFIGURATION ==========
    // Phone: 1 column (list layout)
    // Tablet portrait: 2 columns, Tablet landscape: 3-4 columns
    let authorColumns: number;
    if (deviceType === 'phone') {
        authorColumns = orientation === 'portrait' ? 1 : 2;
    } else {
        authorColumns = calculateColumns(
            availableWidth,
            MIN_CARD_WIDTH.AUTHOR,
            GRID_CONFIG.GAP,
        );
        if (orientation === 'portrait') {
            authorColumns = Math.min(Math.max(authorColumns, 2), 3);
        } else {
            authorColumns = Math.min(Math.max(authorColumns, 3), 4);
        }
    }
    const authorCardWidth =
        authorColumns === 1
            ? availableWidth
            : calculateCardWidth(availableWidth, authorColumns, GRID_CONFIG.GAP);

    // Avatar size scales with device type
    const authorAvatarSize = deviceType === 'phone' ? 60 : 80;

    // ========== LIST DETAIL CONFIGURATION ==========
    // Scale book images in list detail view
    const listDetailImageWidth = deviceType === 'phone' ? 70 : 90;
    const listDetailImageHeight = deviceType === 'phone' ? 100 : 130;

    // ========== FONT SCALE ==========
    const fontScale = deviceType === 'phone' ? 1 : 1.1;

    return {
        width,
        height,
        deviceType,
        orientation,
        windowSize,
        bookColumns,
        bookCardWidth,
        listColumns,
        listCardWidth,
        authorColumns,
        authorCardWidth,
        authorAvatarSize,
        listDetailImageWidth,
        listDetailImageHeight,
        fontScale,
    };
};
