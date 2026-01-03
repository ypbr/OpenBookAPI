using System.Text.Json.Serialization;

namespace OpenBookAPI.Infrastructure.Dtos;

/// <summary>
/// DTO for OpenLibrary bookshelves endpoint response.
/// Endpoint: /works/{workId}/bookshelves.json
/// </summary>
public record OpenLibraryBookshelvesDto(
    [property: JsonPropertyName("counts")] OpenLibraryBookshelvesCountsDto Counts
);

public record OpenLibraryBookshelvesCountsDto(
    [property: JsonPropertyName("want_to_read")] int WantToRead,
    [property: JsonPropertyName("currently_reading")] int CurrentlyReading,
    [property: JsonPropertyName("already_read")] int AlreadyRead
);
