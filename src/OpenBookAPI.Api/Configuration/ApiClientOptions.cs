namespace OpenBookAPI.Api.Configuration;

/// <summary>
/// API client configuration for mobile app authentication
/// </summary>
public class ApiClientOptions
{
    public const string SectionName = "ApiClients";

    /// <summary>
    /// List of registered API clients (mobile apps)
    /// </summary>
    public List<ApiClientConfig> Clients { get; set; } = new();
}

public class ApiClientConfig
{
    /// <summary>
    /// Unique client identifier
    /// </summary>
    public string ClientId { get; set; } = string.Empty;

    /// <summary>
    /// Client secret for authentication
    /// </summary>
    public string ClientSecret { get; set; } = string.Empty;

    /// <summary>
    /// Client display name
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Whether the client is active
    /// </summary>
    public bool IsActive { get; set; } = true;
}
