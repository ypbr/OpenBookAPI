using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using OpenBookAPI.Api.Configuration;
using OpenBookAPI.Api.Services;
using OpenBookAPI.Application.Interfaces;

namespace OpenBookAPI.Api.Extensions;

/// <summary>
/// Extension methods for configuring authentication services
/// </summary>
public static class AuthenticationExtensions
{
    /// <summary>
    /// Adds JWT authentication services to the service collection
    /// </summary>
    public static IServiceCollection AddJwtAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Bind JWT options
        var jwtSection = configuration.GetSection(JwtOptions.SectionName);
        services.Configure<JwtOptions>(jwtSection);

        var jwtOptions = jwtSection.Get<JwtOptions>()
            ?? throw new InvalidOperationException("JWT configuration is missing");

        // Bind API client options
        services.Configure<ApiClientOptions>(configuration.GetSection(ApiClientOptions.SectionName));

        // Register auth service
        services.AddScoped<IAuthService, AuthService>();

        // Configure JWT authentication
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                // Validate the signing key
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtOptions.SecretKey)),

                // Validate the issuer (your API)
                ValidateIssuer = true,
                ValidIssuer = jwtOptions.Issuer,

                // Validate the audience (your mobile app)
                ValidateAudience = true,
                ValidAudience = jwtOptions.Audience,

                // Validate token expiration
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero, // No tolerance for expiration

                // Require expiration time
                RequireExpirationTime = true
            };

            // Custom event handlers for better error responses
            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = context =>
                {
                    if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                    {
                        context.Response.Headers["X-Token-Expired"] = "true";
                    }
                    return Task.CompletedTask;
                },
                OnChallenge = context =>
                {
                    // Skip default response
                    context.HandleResponse();

                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    context.Response.ContentType = "application/problem+json";

                    var problemDetails = new
                    {
                        type = "https://httpstatuses.com/401",
                        title = "Unauthorized",
                        status = 401,
                        detail = "Authentication is required to access this resource.",
                        instance = context.Request.Path.Value
                    };

                    return context.Response.WriteAsJsonAsync(problemDetails);
                },
                OnForbidden = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    context.Response.ContentType = "application/problem+json";

                    var problemDetails = new
                    {
                        type = "https://httpstatuses.com/403",
                        title = "Forbidden",
                        status = 403,
                        detail = "You do not have permission to access this resource.",
                        instance = context.Request.Path.Value
                    };

                    return context.Response.WriteAsJsonAsync(problemDetails);
                }
            };
        });

        // Add authorization
        services.AddAuthorization();

        return services;
    }
}
