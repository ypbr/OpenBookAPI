using System.Text.Json.Serialization;

namespace OpenBookAPI.Infrastructure.Dtos;

/// <summary>
/// Response from OpenLibrary /works/{workKey}/editions.json endpoint
/// </summary>
public record OpenLibraryEditionsResponseDto(
    [property: JsonPropertyName("size")] int Size,
    [property: JsonPropertyName("entries")] List<OpenLibraryEditionDto>? Entries
);
