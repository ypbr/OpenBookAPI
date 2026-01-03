namespace OpenBookAPI.Application.Models;

public record BookDetail(
    string Key,
    string Title,
    string? Description,
    List<string> Subjects,
    List<AuthorReference> Authors,
    string? CoverUrl,
    DateTime? Created,
    DateTime? LastModified
);

public record AuthorReference(
    string Key,
    string? Name
);
