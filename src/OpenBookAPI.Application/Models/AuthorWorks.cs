namespace OpenBookAPI.Application.Models;

public record AuthorWorks(
    int TotalResults,
    int Page,
    int Limit,
    int TotalPages,
    bool HasNextPage,
    bool HasPreviousPage,
    List<WorkSummary> Works
);

public record WorkSummary(
    string Key,
    string Title,
    int? FirstPublishYear,
    string? CoverUrl,
    List<string> Subjects
);
