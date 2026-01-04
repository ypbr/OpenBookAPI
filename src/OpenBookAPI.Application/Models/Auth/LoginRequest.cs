namespace OpenBookAPI.Application.Models.Auth;

/// <summary>
/// Request model for user login
/// </summary>
public record LoginRequest(
    string Username,
    string Password
);
