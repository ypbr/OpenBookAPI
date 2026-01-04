namespace OpenBookAPI.Application.Models.Auth;

/// <summary>
/// Response model containing JWT tokens
/// </summary>
public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    string TokenType = "Bearer"
);
