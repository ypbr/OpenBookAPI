// API Response Types for OpenBookAPI

export interface BookSummary {
    key: string;  // Backend returns 'key', e.g., "OL2333578W"
    title: string;
    authors: string[];  // Backend returns 'authors'
    firstPublishYear?: number;
    coverUrl?: string;
    editionCount?: number;
}

export interface BookSearchResult {
    totalResults: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    books: BookSummary[];
}

// Author reference in BookDetail
export interface AuthorRef {
    key: string;
    name: string | null;
}

export interface BookDetail {
    key: string;  // Backend returns 'key'
    title: string;
    subtitle?: string;
    description?: string;
    subjects?: string[];
    authors: AuthorRef[];  // Backend returns array of {key, name}
    coverUrl?: string;
    firstPublishDate?: string;
    ratingsInfo?: RatingsInfo;
    bookshelvesInfo?: BookshelvesInfo;
}

export interface RatingsInfo {
    average: number;
    count: number;
    ratings1: number;
    ratings2: number;
    ratings3: number;
    ratings4: number;
    ratings5: number;
}

export interface BookshelvesInfo {
    wantToRead: number;
    currentlyReading: number;
    alreadyRead: number;
}

export interface AuthorSummary {
    key: string;  // Backend returns 'key'
    name: string;
    photoUrl?: string;
    workCount?: number;
    birthDate?: string;
    deathDate?: string;
    topWork?: string;
}

export interface AuthorSearchResult {
    totalResults: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    authors: AuthorSummary[];
}

export interface AuthorDetail {
    key: string;  // Backend returns 'key'
    name: string;
    personalName?: string;
    birthDate?: string;
    deathDate?: string;
    bio?: string;
    photoUrl?: string;
    alternateNames?: string[];
}

export interface AuthorWorks {
    totalResults: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    works: BookSummary[];
}

export interface ApiError {
    type: string;
    title: string;
    status: number;
    detail?: string;
    instance?: string;
}

export interface BookPageInfo {
    pageCount: number | null;
    source: string | null;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface SearchParams extends PaginationParams {
    query: string;
}
