using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OpenBookAPI.Application.Interfaces;
using OpenBookAPI.Infrastructure.Configuration;
using OpenBookAPI.Infrastructure.Http;
using OpenBookAPI.Infrastructure.Mappers;

namespace OpenBookAPI.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure OpenLibrary options from appsettings.json
        services.Configure<OpenLibraryOptions>(configuration.GetSection(OpenLibraryOptions.SectionName));

        // Register mappers
        services.AddSingleton<BookMapper>();
        services.AddSingleton<AuthorMapper>();

        // Register the rate limiting handler as transient
        services.AddTransient<RateLimitingHandler>();

        // Get options for HttpClient configuration
        var options = configuration.GetSection(OpenLibraryOptions.SectionName).Get<OpenLibraryOptions>()
            ?? new OpenLibraryOptions();

        // Configure HttpClient with rate limiting
        // See: https://github.com/internetarchive/openlibrary/blob/master/docker/nginx.conf
        services.AddHttpClient("OpenLibrary", client =>
        {
            client.BaseAddress = new Uri(options.BaseUrl);
            client.DefaultRequestHeaders.Add("Accept", "application/json");
            client.DefaultRequestHeaders.Add("User-Agent", options.UserAgent);
        })
        .AddHttpMessageHandler<RateLimitingHandler>();

        services.AddScoped<IOpenLibraryClient, OpenLibraryClient>();

        return services;
    }
}
