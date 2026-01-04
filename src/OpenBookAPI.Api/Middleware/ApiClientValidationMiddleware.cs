using Microsoft.Extensions.Options;
using OpenBookAPI.Api.Configuration;

namespace OpenBookAPI.Api.Middleware;

/// <summary>
/// Middleware that validates API client credentials for authentication endpoints only.
/// Login and refresh token requests require client credentials to identify the mobile app.
/// Other endpoints are protected by JWT Bearer authentication.
/// </summary>
public class ApiClientValidationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ApiClientValidationMiddleware> _logger;

    // Only these paths require client validation (unauthenticated auth endpoints)
    private static readonly string[] ClientValidationRequiredPaths =
    {
        "/api/auth/login",
        "/api/auth/refresh"
    };

    public ApiClientValidationMiddleware(RequestDelegate next, ILogger<ApiClientValidationMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, IOptions<ApiClientOptions> clientOptions)
    {
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";

        // Only validate client credentials for login/refresh endpoints
        // Other endpoints are protected by JWT Bearer token
        if (!ClientValidationRequiredPaths.Any(p => path.StartsWith(p)))
        {
            await _next(context);
            return;
        }

        // Get client credentials from headers
        var clientId = context.Request.Headers["X-Client-Id"].FirstOrDefault();
        var clientSecret = context.Request.Headers["X-Client-Secret"].FirstOrDefault();

        if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
        {
            _logger.LogWarning("Request without client credentials from {IP}",
                context.Connection.RemoteIpAddress);

            await WriteUnauthorizedResponse(context,
                "Missing client credentials",
                "X-Client-Id and X-Client-Secret headers are required");
            return;
        }

        // Validate client credentials
        var validClient = clientOptions.Value.Clients
            .FirstOrDefault(c => c.ClientId == clientId &&
                                 c.ClientSecret == clientSecret &&
                                 c.IsActive);

        if (validClient == null)
        {
            _logger.LogWarning("Invalid client credentials: {ClientId} from {IP}",
                clientId, context.Connection.RemoteIpAddress);

            await WriteUnauthorizedResponse(context,
                "Invalid client credentials",
                "The provided client credentials are not valid");
            return;
        }

        // Add client info to request context for logging/auditing
        context.Items["ClientId"] = clientId;
        context.Items["ClientName"] = validClient.Name;

        await _next(context);
    }

    private static async Task WriteUnauthorizedResponse(HttpContext context, string title, string detail)
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        context.Response.ContentType = "application/problem+json";

        var problemDetails = new
        {
            type = "https://httpstatuses.com/401",
            title,
            status = 401,
            detail,
            instance = context.Request.Path.Value
        };

        await context.Response.WriteAsJsonAsync(problemDetails);
    }
}

public static class ApiClientValidationMiddlewareExtensions
{
    /// <summary>
    /// Adds API client validation middleware to the pipeline.
    /// This ensures only registered mobile apps can access the API.
    /// </summary>
    public static IApplicationBuilder UseApiClientValidation(this IApplicationBuilder app)
    {
        return app.UseMiddleware<ApiClientValidationMiddleware>();
    }
}
