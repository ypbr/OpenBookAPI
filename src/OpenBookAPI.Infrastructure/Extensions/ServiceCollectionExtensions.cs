using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OpenBookAPI.Application.Interfaces;
using OpenBookAPI.Infrastructure.Http;

namespace OpenBookAPI.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Register the rate limiting handler as transient
        services.AddTransient<RateLimitingHandler>();

        // Configure HttpClient with rate limiting
        // OpenLibrary API limits: 180 requests/minute (3 req/sec)
        // See: https://github.com/internetarchive/openlibrary/blob/master/docker/nginx.conf
        services.AddHttpClient("OpenLibrary", client =>
        {
            client.BaseAddress = new Uri("https://openlibrary.org");
            client.DefaultRequestHeaders.Add("Accept", "application/json");
            client.DefaultRequestHeaders.Add("User-Agent", "OpenBookAPI/1.0 (https://github.com/ypbr/OpenBookAPI; ypbr@outlook.com)");
        })
        .AddHttpMessageHandler<RateLimitingHandler>();

        services.AddScoped<IOpenLibraryClient, OpenLibraryClient>();

        return services;
    }
}
