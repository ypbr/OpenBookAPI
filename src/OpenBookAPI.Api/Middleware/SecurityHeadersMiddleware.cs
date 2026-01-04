namespace OpenBookAPI.Api.Middleware;

/// <summary>
/// Middleware that adds OWASP recommended security headers to all responses.
/// </summary>
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Add security headers before the response is sent
        context.Response.OnStarting(() =>
        {
            var headers = context.Response.Headers;

            // Prevent MIME type sniffing
            headers["X-Content-Type-Options"] = "nosniff";

            // Prevent clickjacking attacks
            headers["X-Frame-Options"] = "DENY";

            // Enable XSS filter in older browsers
            headers["X-XSS-Protection"] = "1; mode=block";

            // Control how much referrer information is included
            headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

            // Content Security Policy - restrict resources to same origin for API
            headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'";

            // Permissions Policy - disable unnecessary browser features
            headers["Permissions-Policy"] = "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()";

            // Prevent caching of sensitive data
            headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate";
            headers["Pragma"] = "no-cache";
            headers["Expires"] = "0";

            // Remove headers that expose server information
            headers.Remove("Server");
            headers.Remove("X-Powered-By");
            headers.Remove("X-AspNet-Version");
            headers.Remove("X-AspNetMvc-Version");

            return Task.CompletedTask;
        });

        await _next(context);
    }
}

public static class SecurityHeadersMiddlewareExtensions
{
    /// <summary>
    /// Adds OWASP recommended security headers to all responses.
    /// </summary>
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
    {
        return app.UseMiddleware<SecurityHeadersMiddleware>();
    }
}
