namespace OpenBookAPI.Application.Models;

/// <summary>
/// Bookshelf statistics for a work showing how many users have it on each shelf.
/// </summary>
public record BookshelvesInfo(
    int WantToRead,
    int CurrentlyReading,
    int AlreadyRead,
    int Total
);
