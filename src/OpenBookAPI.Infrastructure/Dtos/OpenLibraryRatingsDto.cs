using System.Text.Json.Serialization;

namespace OpenBookAPI.Infrastructure.Dtos;

/// <summary>
/// DTO for OpenLibrary ratings endpoint response.
/// Endpoint: /works/{workId}/ratings.json
/// </summary>
public record OpenLibraryRatingsDto(
    [property: JsonPropertyName("summary")] OpenLibraryRatingsSummaryDto Summary,
    [property: JsonPropertyName("counts")] OpenLibraryRatingsCountsDto Counts
);

public record OpenLibraryRatingsSummaryDto(
    [property: JsonPropertyName("average")] double Average,
    [property: JsonPropertyName("count")] int Count,
    [property: JsonPropertyName("sortable")] double Sortable
);

public record OpenLibraryRatingsCountsDto(
    [property: JsonPropertyName("1")] int OneStar,
    [property: JsonPropertyName("2")] int TwoStars,
    [property: JsonPropertyName("3")] int ThreeStars,
    [property: JsonPropertyName("4")] int FourStars,
    [property: JsonPropertyName("5")] int FiveStars
);
