// API Response Types for OpenBookAPI

export interface BookSummary {
    workKey: string;
    title: string;
    authorNames: string[];
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

export interface BookDetail {
    workKey: string;
    title: string;
    subtitle?: string;
    description?: string;
    subjects?: string[];
    authorNames: string[];
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
    authorKey: string;
    name: string;
    photoUrl?: string;
    workCount?: number;
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
    authorKey: string;
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

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface SearchParams extends PaginationParams {
    query: string;
}
