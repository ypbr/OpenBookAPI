using OpenBookAPI.Application.Models;

namespace OpenBookAPI.Application.Interfaces;

public interface IBookService
{
    Task<BookSearchResult> SearchBooksAsync(string query, int page = 1, int limit = 10);
    Task<BookDetail?> GetBookByKeyAsync(string bookKey);
    Task<BookDetail?> GetWorkByKeyAsync(string workKey);
    Task<BookEdition?> GetBookByIsbnAsync(string isbn);
    Task<BookshelvesInfo?> GetBookshelvesAsync(string workKey);
    Task<RatingsInfo?> GetRatingsAsync(string workKey);
    Task<BookPageInfo?> GetPageCountAsync(string workKey);
}
