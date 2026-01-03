using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OpenBookAPI.Application.Interfaces;
using OpenBookAPI.Infrastructure.Http;

namespace OpenBookAPI.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpClient("OpenLibrary", client =>
        {
            client.BaseAddress = new Uri("https://openlibrary.org");
            client.DefaultRequestHeaders.Add("Accept", "application/json");
            client.DefaultRequestHeaders.Add("User-Agent", "OpenBookAPI/1.0");
        });

        services.AddScoped<IOpenLibraryClient, OpenLibraryClient>();

        return services;
    }
}
