using System.Text.Json.Serialization;

namespace OpenBookAPI.Infrastructure.Dtos;

public record OpenLibraryAuthorWorksDto(
    [property: JsonPropertyName("size")] int Size,
    [property: JsonPropertyName("entries")] List<OpenLibraryWorkEntryDto> Entries
);

public record OpenLibraryWorkEntryDto(
    [property: JsonPropertyName("key")] string Key,
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("first_publish_date")] string? FirstPublishDate,
    [property: JsonPropertyName("covers")] List<int>? Covers,
    [property: JsonPropertyName("subjects")] List<string>? Subjects
);
