import { API_CONFIG } from '../constants/config';

/**
 * Check if a string is a valid ISBN-10 or ISBN-13
 */
export function isValidIsbn(isbn: string): boolean {
    const cleanIsbn = isbn.replace(/[-\s]/g, '');

    if (cleanIsbn.length === 10) {
        return isValidIsbn10(cleanIsbn);
    }

    if (cleanIsbn.length === 13) {
        return isValidIsbn13(cleanIsbn);
    }

    return false;
}

function isValidIsbn10(isbn: string): boolean {
    if (!/^[\dX]+$/.test(isbn)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += (10 - i) * parseInt(isbn[i], 10);
    }

    const lastChar = isbn[9].toUpperCase();
    sum += lastChar === 'X' ? 10 : parseInt(lastChar, 10);

    return sum % 11 === 0;
}

function isValidIsbn13(isbn: string): boolean {
    if (!/^\d{13}$/.test(isbn)) return false;

    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(isbn[i], 10) * (i % 2 === 0 ? 1 : 3);
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === parseInt(isbn[12], 10);
}

/**
 * Clean a work key or author key from full path
 */
export function cleanKey(key: string): string {
    return key
        .replace('/works/', '')
        .replace('works/', '')
        .replace('/authors/', '')
        .replace('authors/', '');
}

/**
 * Extract the work ID from an OpenLibrary URL or key
 */
export function extractWorkId(urlOrKey: string): string {
    const match = urlOrKey.match(/OL\d+W/);
    return match ? match[0] : urlOrKey;
}

/**
 * Extract the author ID from an OpenLibrary URL or key
 */
export function extractAuthorId(urlOrKey: string): string {
    const match = urlOrKey.match(/OL\d+A/);
    return match ? match[0] : urlOrKey;
}

/**
 * Delay execution for a specified time
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an async function with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = API_CONFIG.RETRY_ATTEMPTS,
    baseDelay: number = API_CONFIG.RETRY_DELAY,
): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            if (i < maxRetries - 1) {
                await delay(baseDelay * Math.pow(2, i));
            }
        }
    }

    throw lastError!;
}
