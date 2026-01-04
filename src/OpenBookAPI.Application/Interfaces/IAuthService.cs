using OpenBookAPI.Application.Models.Auth;

namespace OpenBookAPI.Application.Interfaces;

/// <summary>
/// Service interface for authentication operations
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Authenticates a user and returns JWT tokens
    /// </summary>
    Task<AuthResponse?> AuthenticateAsync(LoginRequest request);

    /// <summary>
    /// Refreshes an access token using a valid refresh token
    /// </summary>
    Task<AuthResponse?> RefreshTokenAsync(string refreshToken);

    /// <summary>
    /// Validates an API client by client ID and secret
    /// </summary>
    Task<bool> ValidateClientAsync(string clientId, string clientSecret);

    /// <summary>
    /// Revokes a refresh token
    /// </summary>
    Task<bool> RevokeTokenAsync(string refreshToken);
}
