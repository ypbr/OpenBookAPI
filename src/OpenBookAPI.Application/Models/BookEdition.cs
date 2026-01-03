namespace OpenBookAPI.Application.Models;

public record BookEdition(
    string Key,
    string Title,
    string? Isbn10,
    string? Isbn13,
    List<string> Authors,
    List<string> Publishers,
    string? PublishDate,
    int? NumberOfPages,
    string? CoverUrl,
    string? WorkKey
);
