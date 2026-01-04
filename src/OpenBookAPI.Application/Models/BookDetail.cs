namespace OpenBookAPI.Application.Models;

public record BookDetail(
    string Key,
    string Title,
    string? Description,
    List<string> Subjects,
    List<string> SubjectPlaces,
    List<string> SubjectPeople,
    List<string> SubjectTimes,
    List<AuthorReference> Authors,
    List<int> CoverIds,
    string? CoverUrl,
    string? Type,
    string? Location,
    int? LatestRevision,
    int? Revision,
    DateTime? Created,
    DateTime? LastModified
);

public record AuthorReference(
    string Key,
    string? Name
);
