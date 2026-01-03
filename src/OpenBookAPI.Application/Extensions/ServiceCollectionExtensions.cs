using Microsoft.Extensions.DependencyInjection;
using OpenBookAPI.Application.Interfaces;
using OpenBookAPI.Application.Services;

namespace OpenBookAPI.Application.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IBookService, BookService>();
        services.AddScoped<IAuthorService, AuthorService>();

        return services;
    }
}
