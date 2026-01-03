namespace OpenBookAPI.Application.Models;

public record AuthorSearchResult(
    int TotalResults,
    int Page,
    int Limit,
    int TotalPages,
    bool HasNextPage,
    bool HasPreviousPage,
    List<AuthorSummary> Authors
);

public record AuthorSummary(
    string Key,
    string Name,
    string? BirthDate,
    string? DeathDate,
    string? TopWork,
    int WorkCount,
    string? PhotoUrl
);
