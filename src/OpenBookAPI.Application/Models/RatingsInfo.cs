namespace OpenBookAPI.Application.Models;

/// <summary>
/// Rating information for a work including average rating and distribution.
/// </summary>
public record RatingsInfo(
    double Average,
    int Count,
    double Sortable,
    RatingDistribution Distribution
);

/// <summary>
/// Distribution of ratings by star count.
/// </summary>
public record RatingDistribution(
    int OneStar,
    int TwoStars,
    int ThreeStars,
    int FourStars,
    int FiveStars
);
