namespace OpenBookAPI.Application.Interfaces;

public interface IOpenLibraryClient
{
    Task<T?> GetAsync<T>(string endpoint) where T : class;
    Task<T?> SearchAsync<T>(string query, int page = 1, int limit = 10) where T : class;
    Task<T?> SearchAuthorsAsync<T>(string query, int page = 1, int limit = 10) where T : class;
    Task<T?> GetAuthorWorksAsync<T>(string authorKey, int page = 1, int limit = 10) where T : class;
}
