namespace OpenBookAPI.Application.Models.Auth;

/// <summary>
/// Request model for refreshing access token
/// </summary>
public record RefreshTokenRequest(
    string RefreshToken
);
