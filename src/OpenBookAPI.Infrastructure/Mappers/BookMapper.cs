using Microsoft.Extensions.Options;
using OpenBookAPI.Application.Models;
using OpenBookAPI.Infrastructure.Configuration;
using OpenBookAPI.Infrastructure.Dtos;

namespace OpenBookAPI.Infrastructure.Mappers;

public class BookMapper
{
    private readonly OpenLibraryOptions _options;

    public BookMapper(IOptions<OpenLibraryOptions> options)
    {
        _options = options.Value;
    }

    public BookSearchResult ToBookSearchResult(OpenLibrarySearchDto dto, int page, int limit)
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

    public BookSummary ToBookSummary(OpenLibrarySearchDocDto dto)
    {
        return new BookSummary(
            Key: ExtractKey(dto.Key),
            Title: dto.Title,
            Authors: dto.AuthorName ?? new List<string>(),
            FirstPublishYear: dto.FirstPublishYear,
            CoverUrl: dto.CoverId.HasValue
                ? $"{_options.CoverBaseUrl}/{dto.CoverId}-{_options.CoverSize.Thumbnail}.jpg"
                : null
        );
    }

    public BookDetail ToBookDetail(OpenLibraryWorkDto dto)
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
                ? $"{_options.CoverBaseUrl}/{coverId}-{_options.CoverSize.Detail}.jpg"
                : null,
            Created: ParseDateTime(dto.Created?.Value),
            LastModified: ParseDateTime(dto.LastModified?.Value)
        );
    }

    public BookEdition ToBookEdition(OpenLibraryEditionDto dto)
    {
        return new BookEdition(
            Key: ExtractKey(dto.Key),
            Title: dto.Title,
            Isbn10: dto.Isbn10?.FirstOrDefault(),
            Isbn13: dto.Isbn13?.FirstOrDefault(),
            Authors: new List<string>(),
            Publishers: dto.Publishers ?? new List<string>(),
            PublishDate: dto.PublishDate,
            NumberOfPages: dto.NumberOfPages,
            CoverUrl: dto.Covers?.FirstOrDefault() is int coverId
                ? $"{_options.CoverBaseUrl}/{coverId}-{_options.CoverSize.Detail}.jpg"
                : null,
            WorkKey: dto.Works?.FirstOrDefault()?.Key is string workKey
                ? ExtractKey(workKey)
                : null
        );
    }

    private static string ExtractKey(string fullKey)
    {
        return fullKey.Split('/').LastOrDefault() ?? fullKey;
    }

    private static string? ExtractDescription(object? description)
    {
        if (description == null) return null;

        if (description is string str) return str;

        if (description is System.Text.Json.JsonElement element)
        {
            if (element.ValueKind == System.Text.Json.JsonValueKind.String)
                return element.GetString();

            if (element.TryGetProperty("value", out var valueElement))
                return valueElement.GetString();
        }

        return description.ToString();
    }

    private static DateTime? ParseDateTime(string? value)
    {
        if (string.IsNullOrEmpty(value)) return null;
        return DateTime.TryParse(value, out var dt) ? dt : null;
    }
}
