using System.Text.Json.Serialization;

namespace OpenBookAPI.Infrastructure.Dtos;

public record OpenLibraryAuthorDto(
    [property: JsonPropertyName("key")] string Key,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("bio")] object? Bio,
    [property: JsonPropertyName("birth_date")] string? BirthDate,
    [property: JsonPropertyName("death_date")] string? DeathDate,
    [property: JsonPropertyName("photos")] List<int>? Photos,
    [property: JsonPropertyName("alternate_names")] List<string>? AlternateNames,
    [property: JsonPropertyName("links")] List<OpenLibraryLinkDto>? Links
);

public record OpenLibraryLinkDto(
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("url")] string Url,
    [property: JsonPropertyName("type")] OpenLibraryTypeDto? Type
);

public record OpenLibraryTypeDto(
    [property: JsonPropertyName("key")] string Key
);
