using System.Text.Json.Serialization;

namespace OpenBookAPI.Infrastructure.Dtos;

public record OpenLibrarySearchDto(
    [property: JsonPropertyName("numFound")] int NumFound,
    [property: JsonPropertyName("start")] int Start,
    [property: JsonPropertyName("docs")] List<OpenLibrarySearchDocDto> Docs
);

public record OpenLibrarySearchDocDto(
    [property: JsonPropertyName("key")] string Key,
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("author_name")] List<string>? AuthorName,
    [property: JsonPropertyName("first_publish_year")] int? FirstPublishYear,
    [property: JsonPropertyName("cover_i")] int? CoverId
);
