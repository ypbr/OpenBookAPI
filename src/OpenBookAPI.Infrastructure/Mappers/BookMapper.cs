using OpenBookAPI.Application.Models;
using OpenBookAPI.Infrastructure.Dtos;

namespace OpenBookAPI.Infrastructure.Mappers;

public static class BookMapper
{
    private const string CoverBaseUrl = "https://covers.openlibrary.org/b/id";

    public static BookSearchResult ToBookSearchResult(OpenLibrarySearchDto dto, int page, int limit)
    {
        var totalPages = (int)Math.Ceiling((double)dto.NumFound / limit);

        return new BookSearchResult(
            TotalResults: dto.NumFound,
            Page: page,
            Limit: limit,
            TotalPages: totalPages,
            HasNextPage: page < totalPages,
            HasPreviousPage: page > 1,
            Books: dto.Docs.Select(ToBookSummary).ToList()
        );
    }

    public static BookSummary ToBookSummary(OpenLibrarySearchDocDto dto)
    {
        return new BookSummary(
            Key: ExtractKey(dto.Key),
            Title: dto.Title,
            Authors: dto.AuthorName ?? new List<string>(),
            FirstPublishYear: dto.FirstPublishYear,
            CoverUrl: dto.CoverId.HasValue ? $"{CoverBaseUrl}/{dto.CoverId}-M.jpg" : null
        );
    }

    public static BookDetail ToBookDetail(OpenLibraryWorkDto dto)
    {
        return new BookDetail(
            Key: ExtractKey(dto.Key),
            Title: dto.Title,
            Description: ExtractDescription(dto.Description),
            Subjects: dto.Subjects ?? new List<string>(),
            Authors: dto.Authors?.Select(a => new AuthorReference(
                Key: ExtractKey(a.Author?.Key ?? string.Empty),
                Name: null
            )).ToList() ?? new List<AuthorReference>(),
            CoverUrl: dto.Covers?.FirstOrDefault() is int coverId
                ? $"{CoverBaseUrl}/{coverId}-L.jpg"
                : null,
            Created: ParseDateTime(dto.Created?.Value),
            LastModified: ParseDateTime(dto.LastModified?.Value)
        );
    }

    private static string ExtractKey(string fullKey)
    {
        // "/works/OL123W" -> "OL123W"
        return fullKey.Split('/').LastOrDefault() ?? fullKey;
    }

    private static string? ExtractDescription(object? description)
    {
        if (description == null) return null;

        if (description is string str) return str;

        // OpenLibrary sometimes returns { "type": "/type/text", "value": "..." }
        if (description is System.Text.Json.JsonElement element)
        {
            if (element.ValueKind == System.Text.Json.JsonValueKind.String)
                return element.GetString();

            if (element.TryGetProperty("value", out var valueElement))
                return valueElement.GetString();
        }

        return description.ToString();
    }

    public static BookEdition ToBookEdition(OpenLibraryEditionDto dto)
    {
        return new BookEdition(
            Key: ExtractKey(dto.Key),
            Title: dto.Title,
            Isbn10: dto.Isbn10?.FirstOrDefault(),
            Isbn13: dto.Isbn13?.FirstOrDefault(),
            Authors: new List<string>(), // Authors need separate lookup
            Publishers: dto.Publishers ?? new List<string>(),
            PublishDate: dto.PublishDate,
            NumberOfPages: dto.NumberOfPages,
            CoverUrl: dto.Covers?.FirstOrDefault() is int coverId
                ? $"{CoverBaseUrl}/{coverId}-L.jpg"
                : null,
            WorkKey: dto.Works?.FirstOrDefault()?.Key is string workKey
                ? ExtractKey(workKey)
                : null
        );
    }

    private static DateTime? ParseDateTime(string? value)
    {
        if (string.IsNullOrEmpty(value)) return null;
        return DateTime.TryParse(value, out var dt) ? dt : null;
    }
}
