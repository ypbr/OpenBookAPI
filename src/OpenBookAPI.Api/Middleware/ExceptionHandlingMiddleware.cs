using System.Net;
using System.Text.Json;
using OpenBookAPI.Infrastructure.Exceptions;

namespace OpenBookAPI.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (OpenLibraryException ex)
        {
            _logger.LogWarning(ex, "OpenLibrary API error: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex, _environment.IsDevelopment());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex, _environment.IsDevelopment());
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception, bool isDevelopment)
    {
        context.Response.ContentType = "application/problem+json";

        var (statusCode, title) = exception switch
        {
            OpenLibraryException olEx => (olEx.StatusCode ?? 502, "OpenLibrary API Error"),
            ArgumentException => ((int)HttpStatusCode.BadRequest, "Bad Request"),
            _ => ((int)HttpStatusCode.InternalServerError, "Internal Server Error")
        };

        context.Response.StatusCode = statusCode;

        // Hide detailed error messages in production for security
        var detailMessage = isDevelopment
            ? exception.Message
            : exception switch
            {
                OpenLibraryException => exception.Message, // Safe to show - external API error
                ArgumentException => exception.Message,     // Safe to show - validation error
                _ => "An unexpected error occurred. Please try again later."
            };

        var problemDetails = new
        {
            type = $"https://httpstatuses.com/{statusCode}",
            title,
            status = statusCode,
            detail = detailMessage,
            instance = context.Request.Path.Value
        };

        var json = JsonSerializer.Serialize(problemDetails, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}

public static class ExceptionHandlingMiddlewareExtensions
{
    public static IApplicationBuilder UseExceptionHandling(this IApplicationBuilder app)
    {
        return app.UseMiddleware<ExceptionHandlingMiddleware>();
    }
}
