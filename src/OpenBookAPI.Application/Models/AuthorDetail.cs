namespace OpenBookAPI.Application.Models;

public record AuthorDetail(
    string Key,
    string Name,
    string? Bio,
    string? BirthDate,
    string? DeathDate,
    string? PhotoUrl,
    List<string> AlternateNames,
    List<string> Links
);
