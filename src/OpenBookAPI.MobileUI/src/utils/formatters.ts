/**
 * Format a number with commas for thousands
 */
export function formatNumber(num: number): string {
    return num.toLocaleString();
}

/**
 * Truncate text to a specific length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength - 3)}...`;
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Unknown';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            // If not a valid date, return as-is (might be just a year)
            return dateString;
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return dateString;
    }
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(text: string): string {
    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
