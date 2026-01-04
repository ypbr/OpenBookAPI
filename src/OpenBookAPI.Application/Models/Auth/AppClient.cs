namespace OpenBookAPI.Application.Models.Auth;

/// <summary>
/// Represents a registered mobile application client
/// </summary>
public record AppClient(
    string ClientId,
    string ClientSecret,
    string Name,
    bool IsActive = true
);
