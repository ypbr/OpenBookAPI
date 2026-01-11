// API Types - Book related interfaces

export interface BookSummary {
    workKey: string;
    title: string;
    authorName: string[];
    authorKey: string[];
    firstPublishYear?: number;
    coverUrl?: string;
    editionCount: number;
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
    subjects: string[];
    authors: AuthorReference[];
    covers: string[];
    firstPublishDate?: string;
    links: BookLink[];
    excerpts: BookExcerpt[];
    ratings?: RatingsInfo;
    bookshelves?: BookshelvesInfo;
}

export interface AuthorReference {
    key: string;
    name: string;
}

export interface BookLink {
    title: string;
    url: string;
}

export interface BookExcerpt {
    text: string;
    comment?: string;
}

export interface RatingsInfo {
    average: number;
    count: number;
}

export interface BookshelvesInfo {
    wantToRead: number;
    currentlyReading: number;
    alreadyRead: number;
}

// Author related interfaces
export interface AuthorSummary {
    authorKey: string;
    name: string;
    birthDate?: string;
    topWork?: string;
    workCount: number;
    photoUrl?: string;
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
    birthDate?: string;
    deathDate?: string;
    bio?: string;
    alternateNames: string[];
    links: AuthorLink[];
    photos: string[];
}

export interface AuthorLink {
    title: string;
    url: string;
}

export interface AuthorWorks {
    authorKey: string;
    totalResults: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    works: WorkSummary[];
}

export interface WorkSummary {
    workKey: string;
    title: string;
    coverUrl?: string;
    firstPublishYear?: number;
}
