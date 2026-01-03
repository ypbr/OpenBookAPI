using System.Text.Json.Serialization;

namespace OpenBookAPI.Infrastructure.Dtos;

public record OpenLibraryAuthorSearchDto(
    [property: JsonPropertyName("numFound")] int NumFound,
    [property: JsonPropertyName("start")] int Start,
    [property: JsonPropertyName("docs")] List<OpenLibraryAuthorSearchDocDto> Docs
);

public record OpenLibraryAuthorSearchDocDto(
    [property: JsonPropertyName("key")] string Key,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("birth_date")] string? BirthDate,
    [property: JsonPropertyName("death_date")] string? DeathDate,
    [property: JsonPropertyName("top_work")] string? TopWork,
    [property: JsonPropertyName("work_count")] int WorkCount,
    [property: JsonPropertyName("_version_")] long? Version
);
