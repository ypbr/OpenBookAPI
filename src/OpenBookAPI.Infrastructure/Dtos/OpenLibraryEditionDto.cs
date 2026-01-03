using System.Text.Json.Serialization;

namespace OpenBookAPI.Infrastructure.Dtos;

public record OpenLibraryEditionDto(
    [property: JsonPropertyName("key")] string Key,
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("isbn_10")] List<string>? Isbn10,
    [property: JsonPropertyName("isbn_13")] List<string>? Isbn13,
    [property: JsonPropertyName("authors")] List<OpenLibraryKeyDto>? Authors,
    [property: JsonPropertyName("publishers")] List<string>? Publishers,
    [property: JsonPropertyName("publish_date")] string? PublishDate,
    [property: JsonPropertyName("number_of_pages")] int? NumberOfPages,
    [property: JsonPropertyName("covers")] List<int>? Covers,
    [property: JsonPropertyName("works")] List<OpenLibraryKeyDto>? Works
);
