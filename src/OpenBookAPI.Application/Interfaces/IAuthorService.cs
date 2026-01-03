using OpenBookAPI.Application.Models;

namespace OpenBookAPI.Application.Interfaces;

public interface IAuthorService
{
    Task<AuthorDetail?> GetAuthorByKeyAsync(string authorKey);
    Task<AuthorSearchResult> SearchAuthorsAsync(string query, int page = 1, int limit = 10);
    Task<AuthorWorks> GetAuthorWorksAsync(string authorKey, int page = 1, int limit = 10);
}
