using OpenBookAPI.Application.Models;

namespace OpenBookAPI.Application.Interfaces;

public interface IBookService
{
    Task<BookSearchResult> SearchBooksAsync(string query, int page = 1, int limit = 10);
    Task<BookDetail?> GetBookByKeyAsync(string workKey);
    Task<BookEdition?> GetBookByIsbnAsync(string isbn);
}
