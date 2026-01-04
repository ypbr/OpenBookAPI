using System.Collections.Concurrent;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using OpenBookAPI.Api.Configuration;
using OpenBookAPI.Application.Interfaces;
using OpenBookAPI.Application.Models.Auth;

namespace OpenBookAPI.Api.Services;

/// <summary>
/// Implementation of authentication service using JWT tokens
/// </summary>
public class AuthService : IAuthService
{
    private readonly JwtOptions _jwtOptions;
    private readonly ApiClientOptions _clientOptions;

    // In-memory store for refresh tokens (in production, use a database)
    private static readonly ConcurrentDictionary<string, RefreshTokenData> _refreshTokens = new();

    // Demo users (in production, use a database with hashed passwords)
    private static readonly Dictionary<string, (string Password, string Role)> _demoUsers = new()
    {
        { "demo", ("demo123", "User") },
        { "admin", ("admin123", "Admin") }
    };

    public AuthService(IOptions<JwtOptions> jwtOptions, IOptions<ApiClientOptions> clientOptions)
    {
        _jwtOptions = jwtOptions.Value;
        _clientOptions = clientOptions.Value;
    }

    public Task<AuthResponse?> AuthenticateAsync(LoginRequest request)
    {
        // Validate user credentials (in production, check against database)
        if (!_demoUsers.TryGetValue(request.Username, out var userData) ||
            userData.Password != request.Password)
        {
            return Task.FromResult<AuthResponse?>(null);
        }

        var (accessToken, expiresAt) = GenerateAccessToken(request.Username, userData.Role);
        var refreshToken = GenerateRefreshToken(request.Username);

        var response = new AuthResponse(accessToken, refreshToken, expiresAt);
        return Task.FromResult<AuthResponse?>(response);
    }

    public Task<AuthResponse?> RefreshTokenAsync(string refreshToken)
    {
        if (!_refreshTokens.TryGetValue(refreshToken, out var tokenData))
        {
            return Task.FromResult<AuthResponse?>(null);
        }

        if (tokenData.ExpiresAt < DateTime.UtcNow || tokenData.IsRevoked)
        {
            _refreshTokens.TryRemove(refreshToken, out _);
            return Task.FromResult<AuthResponse?>(null);
        }

        // Get user role
        var role = _demoUsers.TryGetValue(tokenData.Username, out var userData)
            ? userData.Role
            : "User";

        // Generate new tokens
        var (accessToken, expiresAt) = GenerateAccessToken(tokenData.Username, role);
        var newRefreshToken = GenerateRefreshToken(tokenData.Username);

        // Revoke old refresh token
        tokenData.IsRevoked = true;

        var response = new AuthResponse(accessToken, newRefreshToken, expiresAt);
        return Task.FromResult<AuthResponse?>(response);
    }

    public Task<bool> ValidateClientAsync(string clientId, string clientSecret)
    {
        var client = _clientOptions.Clients
            .FirstOrDefault(c => c.ClientId == clientId &&
                                 c.ClientSecret == clientSecret &&
                                 c.IsActive);

        return Task.FromResult(client != null);
    }

    public Task<bool> RevokeTokenAsync(string refreshToken)
    {
        if (_refreshTokens.TryGetValue(refreshToken, out var tokenData))
        {
            tokenData.IsRevoked = true;
            return Task.FromResult(true);
        }
        return Task.FromResult(false);
    }

    private (string Token, DateTime ExpiresAt) GenerateAccessToken(string username, string role)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtOptions.AccessTokenExpirationMinutes);

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Sub, username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
        };

        var token = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }

    private string GenerateRefreshToken(string username)
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);

        var refreshToken = Convert.ToBase64String(randomBytes);
        var expiresAt = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenExpirationDays);

        _refreshTokens[refreshToken] = new RefreshTokenData
        {
            Username = username,
            ExpiresAt = expiresAt,
            IsRevoked = false
        };

        // Clean up expired tokens periodically
        CleanupExpiredTokens();

        return refreshToken;
    }

    private static void CleanupExpiredTokens()
    {
        var expiredTokens = _refreshTokens
            .Where(kvp => kvp.Value.ExpiresAt < DateTime.UtcNow || kvp.Value.IsRevoked)
            .Select(kvp => kvp.Key)
            .ToList();

        foreach (var token in expiredTokens)
        {
            _refreshTokens.TryRemove(token, out _);
        }
    }

    private class RefreshTokenData
    {
        public string Username { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public bool IsRevoked { get; set; }
    }
}
