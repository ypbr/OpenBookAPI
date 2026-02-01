using OpenBookAPI.Application.Interfaces;
using OpenBookAPI.Application.Models;

namespace OpenBookAPI.Application.Services;

public class BookService : IBookService
{
    private readonly IOpenLibraryClient _openLibraryClient;

    public BookService(IOpenLibraryClient openLibraryClient)
    {
        _openLibraryClient = openLibraryClient;
    }

    public async Task<BookSearchResult> SearchBooksAsync(string query, int page = 1, int limit = 10)
    {
        var result = await _openLibraryClient.SearchAsync<BookSearchResult>(query, page, limit);
        return result ?? new BookSearchResult(
            TotalResults: 0,
            Page: page,
            Limit: limit,
            TotalPages: 0,
            HasNextPage: false,
            HasPreviousPage: false,
            Books: new List<BookSummary>()
        );
    }

    public async Task<BookDetail?> GetBookByKeyAsync(string bookKey)
    {
        var endpoint = $"/books/{bookKey}.json";
        return await _openLibraryClient.GetAsync<BookDetail>(endpoint);
    }

    public async Task<BookDetail?> GetWorkByKeyAsync(string workKey)
    {
        var endpoint = $"/works/{workKey}.json";
        return await _openLibraryClient.GetAsync<BookDetail>(endpoint);
    }

    public async Task<BookEdition?> GetBookByIsbnAsync(string isbn)
    {
        // Remove hyphens from ISBN
        var cleanIsbn = isbn.Replace("-", "").Replace(" ", "");
        var endpoint = $"/isbn/{cleanIsbn}.json";
        return await _openLibraryClient.GetAsync<BookEdition>(endpoint);
    }

    public async Task<BookshelvesInfo?> GetBookshelvesAsync(string workKey)
    {
        var endpoint = $"/works/{workKey}/bookshelves.json";
        return await _openLibraryClient.GetAsync<BookshelvesInfo>(endpoint);
    }

    public async Task<RatingsInfo?> GetRatingsAsync(string workKey)
    {
        var endpoint = $"/works/{workKey}/ratings.json";
        return await _openLibraryClient.GetAsync<RatingsInfo>(endpoint);
    }

    public async Task<BookPageInfo?> GetPageCountAsync(string workKey)
    {
        var pageCount = await _openLibraryClient.GetWorkPageCountAsync(workKey);
        if (pageCount == null)
            return null;

        return new BookPageInfo(
            PageCount: pageCount,
            Source: "OpenLibrary"
        );
    }
}
