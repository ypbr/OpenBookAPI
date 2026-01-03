namespace OpenBookAPI.Application.Models;

public record PaginatedResult<T>(
    int TotalResults,
    int Page,
    int Limit,
    int TotalPages,
    bool HasNextPage,
    bool HasPreviousPage,
    List<T> Items
);

public record BookSearchResult(
    int TotalResults,
    int Page,
    int Limit,
    int TotalPages,
    bool HasNextPage,
    bool HasPreviousPage,
    List<BookSummary> Books
);

public record BookSummary(
    string Key,
    string Title,
    List<string> Authors,
    int? FirstPublishYear,
    string? CoverUrl
);
