using System.Text.Json.Serialization;

namespace OpenBookAPI.Infrastructure.Dtos;

public record OpenLibraryWorkDto(
    [property: JsonPropertyName("key")] string Key,
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("description")] object? Description,
    [property: JsonPropertyName("subjects")] List<string>? Subjects,
    [property: JsonPropertyName("authors")] List<OpenLibraryAuthorReferenceDto>? Authors,
    [property: JsonPropertyName("covers")] List<int>? Covers,
    [property: JsonPropertyName("created")] OpenLibraryDateTimeDto? Created,
    [property: JsonPropertyName("last_modified")] OpenLibraryDateTimeDto? LastModified
);

public record OpenLibraryAuthorReferenceDto(
    [property: JsonPropertyName("author")] OpenLibraryKeyDto? Author,
    [property: JsonPropertyName("type")] OpenLibraryKeyDto? Type
);

public record OpenLibraryKeyDto(
    [property: JsonPropertyName("key")] string Key
);

public record OpenLibraryDateTimeDto(
    [property: JsonPropertyName("type")] string Type,
    [property: JsonPropertyName("value")] string Value
);
