namespace OpenBookAPI.Infrastructure.Configuration;

/// <summary>
/// Configuration options for OpenLibrary API integration.
/// </summary>
public class OpenLibraryOptions
{
    public const string SectionName = "OpenLibrary";

    /// <summary>
    /// Base URL for OpenLibrary API. Default: https://openlibrary.org
    /// </summary>
    public string BaseUrl { get; set; } = "https://openlibrary.org";

    /// <summary>
    /// Base URL for book covers. Default: https://covers.openlibrary.org/b/id
    /// </summary>
    public string CoverBaseUrl { get; set; } = "https://covers.openlibrary.org/b/id";

    /// <summary>
    /// Base URL for author photos. Default: https://covers.openlibrary.org/a/id
    /// </summary>
    public string PhotoBaseUrl { get; set; } = "https://covers.openlibrary.org/a/id";

    /// <summary>
    /// Cover size options.
    /// </summary>
    public CoverSizeOptions CoverSize { get; set; } = new();

    /// <summary>
    /// Rate limiting options.
    /// </summary>
    public RateLimitOptions RateLimit { get; set; } = new();

    /// <summary>
    /// User-Agent header value for API requests.
    /// </summary>
    public string UserAgent { get; set; } = "OpenBookAPI/1.0 (https://github.com/ypbr/OpenBookAPI; ypbr@outlook.com)";
}

/// <summary>
/// Cover size configuration.
/// S = Small (45x68), M = Medium (180x273), L = Large (original)
/// </summary>
public class CoverSizeOptions
{
    /// <summary>
    /// Size for search result thumbnails. Default: M
    /// </summary>
    public string Thumbnail { get; set; } = "M";

    /// <summary>
    /// Size for detail pages. Default: L
    /// </summary>
    public string Detail { get; set; } = "L";
}

/// <summary>
/// Rate limiting configuration based on OpenLibrary nginx.conf.
/// See: https://github.com/internetarchive/openlibrary/blob/master/docker/nginx.conf
/// </summary>
public class RateLimitOptions
{
    /// <summary>
    /// Maximum burst capacity. Default: 5
    /// </summary>
    public int TokenLimit { get; set; } = 5;

    /// <summary>
    /// Tokens replenished per period. Default: 3 (180 req/min)
    /// </summary>
    public int TokensPerPeriod { get; set; } = 3;

    /// <summary>
    /// Replenishment period in seconds. Default: 1
    /// </summary>
    public int ReplenishmentPeriodSeconds { get; set; } = 1;

    /// <summary>
    /// Maximum queued requests. Default: 100
    /// </summary>
    public int QueueLimit { get; set; } = 100;
}
