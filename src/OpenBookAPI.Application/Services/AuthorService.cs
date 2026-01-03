using OpenBookAPI.Application.Interfaces;
using OpenBookAPI.Application.Models;

namespace OpenBookAPI.Application.Services;

public class AuthorService : IAuthorService
{
    private readonly IOpenLibraryClient _openLibraryClient;

    public AuthorService(IOpenLibraryClient openLibraryClient)
    {
        _openLibraryClient = openLibraryClient;
    }

    public async Task<AuthorDetail?> GetAuthorByKeyAsync(string authorKey)
    {
        var endpoint = $"/authors/{authorKey}.json";
        return await _openLibraryClient.GetAsync<AuthorDetail>(endpoint);
    }

    public async Task<AuthorSearchResult> SearchAuthorsAsync(string query, int page = 1, int limit = 10)
    {
        var result = await _openLibraryClient.SearchAuthorsAsync<AuthorSearchResult>(query, page, limit);
        return result ?? new AuthorSearchResult(
            TotalResults: 0,
            Page: page,
            Limit: limit,
            TotalPages: 0,
            HasNextPage: false,
            HasPreviousPage: false,
            Authors: new List<AuthorSummary>()
        );
    }

    public async Task<AuthorWorks> GetAuthorWorksAsync(string authorKey, int page = 1, int limit = 10)
    {
        var result = await _openLibraryClient.GetAuthorWorksAsync<AuthorWorks>(authorKey, page, limit);
        return result ?? new AuthorWorks(
            TotalResults: 0,
            Page: page,
            Limit: limit,
            TotalPages: 0,
            HasNextPage: false,
            HasPreviousPage: false,
            Works: new List<WorkSummary>()
        );
    }
}
