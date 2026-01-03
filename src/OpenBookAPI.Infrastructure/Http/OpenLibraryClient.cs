using System.Net.Http.Json;
using System.Text.Json;
using OpenBookAPI.Application.Interfaces;
using OpenBookAPI.Application.Models;
using OpenBookAPI.Infrastructure.Dtos;
using OpenBookAPI.Infrastructure.Exceptions;
using OpenBookAPI.Infrastructure.Mappers;

namespace OpenBookAPI.Infrastructure.Http;

public class OpenLibraryClient : IOpenLibraryClient
{
    private readonly HttpClient _httpClient;
    private readonly JsonSerializerOptions _jsonOptions;
    private readonly BookMapper _bookMapper;
    private readonly AuthorMapper _authorMapper;

    public OpenLibraryClient(
        IHttpClientFactory httpClientFactory,
        BookMapper bookMapper,
        AuthorMapper authorMapper)
    {
        _httpClient = httpClientFactory.CreateClient("OpenLibrary");
        _bookMapper = bookMapper;
        _authorMapper = authorMapper;
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
    }

    public async Task<T?> GetAsync<T>(string endpoint) where T : class
    {
        try
        {
            var response = await _httpClient.GetAsync(endpoint);

            if (!response.IsSuccessStatusCode)
            {
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                    return null;

                throw new OpenLibraryException(
                    $"OpenLibrary API returned {(int)response.StatusCode}",
                    (int)response.StatusCode,
                    endpoint);
            }

            // Handle type-specific deserialization
            if (typeof(T) == typeof(BookDetail))
            {
                var dto = await response.Content.ReadFromJsonAsync<OpenLibraryWorkDto>(_jsonOptions);
                if (dto == null) return null;
                return _bookMapper.ToBookDetail(dto) as T;
            }

            if (typeof(T) == typeof(AuthorDetail))
            {
                var dto = await response.Content.ReadFromJsonAsync<OpenLibraryAuthorDto>(_jsonOptions);
                if (dto == null) return null;
                return _authorMapper.ToAuthorDetail(dto) as T;
            }

            if (typeof(T) == typeof(BookEdition))
            {
                var dto = await response.Content.ReadFromJsonAsync<OpenLibraryEditionDto>(_jsonOptions);
                if (dto == null) return null;
                return _bookMapper.ToBookEdition(dto) as T;
            }

            if (typeof(T) == typeof(BookshelvesInfo))
            {
                var dto = await response.Content.ReadFromJsonAsync<OpenLibraryBookshelvesDto>(_jsonOptions);
                if (dto == null) return null;
                return _bookMapper.ToBookshelvesInfo(dto) as T;
            }

            if (typeof(T) == typeof(RatingsInfo))
            {
                var dto = await response.Content.ReadFromJsonAsync<OpenLibraryRatingsDto>(_jsonOptions);
                if (dto == null) return null;
                return _bookMapper.ToRatingsInfo(dto) as T;
            }

            return await response.Content.ReadFromJsonAsync<T>(_jsonOptions);
        }
        catch (HttpRequestException ex)
        {
            throw new OpenLibraryException($"Failed to connect to OpenLibrary: {ex.Message}", ex);
        }
    }

    public async Task<T?> SearchAsync<T>(string query, int page = 1, int limit = 10) where T : class
    {
        try
        {
            var offset = (page - 1) * limit;
            var searchUrl = $"/search.json?q={Uri.EscapeDataString(query)}&offset={offset}&limit={limit}";

            var response = await _httpClient.GetAsync(searchUrl);

            if (!response.IsSuccessStatusCode)
            {
                throw new OpenLibraryException(
                    $"OpenLibrary search returned {(int)response.StatusCode}",
                    (int)response.StatusCode,
                    searchUrl);
            }

            if (typeof(T) == typeof(BookSearchResult))
            {
                var dto = await response.Content.ReadFromJsonAsync<OpenLibrarySearchDto>(_jsonOptions);
                if (dto == null) return null;
                return _bookMapper.ToBookSearchResult(dto, page, limit) as T;
            }

            return await response.Content.ReadFromJsonAsync<T>(_jsonOptions);
        }
        catch (HttpRequestException ex)
        {
            throw new OpenLibraryException($"Failed to search OpenLibrary: {ex.Message}", ex);
        }
    }

    public async Task<T?> SearchAuthorsAsync<T>(string query, int page = 1, int limit = 10) where T : class
    {
        try
        {
            var offset = (page - 1) * limit;
            var searchUrl = $"/search/authors.json?q={Uri.EscapeDataString(query)}&offset={offset}&limit={limit}";

            var response = await _httpClient.GetAsync(searchUrl);

            if (!response.IsSuccessStatusCode)
            {
                throw new OpenLibraryException(
                    $"OpenLibrary author search returned {(int)response.StatusCode}",
                    (int)response.StatusCode,
                    searchUrl);
            }

            if (typeof(T) == typeof(AuthorSearchResult))
            {
                var dto = await response.Content.ReadFromJsonAsync<OpenLibraryAuthorSearchDto>(_jsonOptions);
                if (dto == null) return null;
                return _authorMapper.ToAuthorSearchResult(dto, page, limit) as T;
            }

            return await response.Content.ReadFromJsonAsync<T>(_jsonOptions);
        }
        catch (HttpRequestException ex)
        {
            throw new OpenLibraryException($"Failed to search authors: {ex.Message}", ex);
        }
    }

    public async Task<T?> GetAuthorWorksAsync<T>(string authorKey, int page = 1, int limit = 10) where T : class
    {
        try
        {
            var worksUrl = $"/authors/{authorKey}/works.json?limit=1000";

            var response = await _httpClient.GetAsync(worksUrl);

            if (!response.IsSuccessStatusCode)
            {
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                    return null;

                throw new OpenLibraryException(
                    $"OpenLibrary author works returned {(int)response.StatusCode}",
                    (int)response.StatusCode,
                    worksUrl);
            }

            if (typeof(T) == typeof(AuthorWorks))
            {
                var dto = await response.Content.ReadFromJsonAsync<OpenLibraryAuthorWorksDto>(_jsonOptions);
                if (dto == null) return null;
                return _authorMapper.ToAuthorWorks(dto, page, limit) as T;
            }

            return await response.Content.ReadFromJsonAsync<T>(_jsonOptions);
        }
        catch (HttpRequestException ex)
        {
            throw new OpenLibraryException($"Failed to get author works: {ex.Message}", ex);
        }
    }
}
