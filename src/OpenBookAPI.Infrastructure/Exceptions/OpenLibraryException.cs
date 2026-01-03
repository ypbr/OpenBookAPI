namespace OpenBookAPI.Infrastructure.Exceptions;

public class OpenLibraryException : Exception
{
    public int? StatusCode { get; }
    public string? Endpoint { get; }

    public OpenLibraryException(string message) : base(message)
    {
    }

    public OpenLibraryException(string message, int statusCode, string endpoint)
        : base(message)
    {
        StatusCode = statusCode;
        Endpoint = endpoint;
    }

    public OpenLibraryException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
