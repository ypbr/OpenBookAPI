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
            SubjectPlaces: dto.SubjectPlaces ?? new List<string>(),
            SubjectPeople: dto.SubjectPeople ?? new List<string>(),
            SubjectTimes: dto.SubjectTimes ?? new List<string>(),
            Authors: dto.Authors?.Select(a => new AuthorReference(
                Key: ExtractKey(a.Author?.Key ?? string.Empty),
                Name: null
            )).ToList() ?? new List<AuthorReference>(),
            CoverIds: dto.Covers?.Where(c => c > 0).ToList() ?? new List<int>(),
            CoverUrl: dto.Covers?.FirstOrDefault(c => c > 0) is int coverId
                ? $"{_options.CoverBaseUrl}/{coverId}-{_options.CoverSize.Detail}.jpg"
                : null,
            Type: ExtractKey(dto.Type?.Key ?? string.Empty),
            Location: dto.Location,
            LatestRevision: dto.LatestRevision,
            Revision: dto.Revision,
            Created: ParseDateTime(dto.Created?.Value),
            LastModified: ParseDateTime(dto.LastModified?.Value)
        );
    }

    public BookEdition ToBookEdition(OpenLibraryEditionDto dto)
    {
        return new BookEdition(
            Key: ExtractKey(dto.Key),
            Title: dto.Title,
            Isbn10: dto.Isbn10 ?? new List<string>(),
            Isbn13: dto.Isbn13 ?? new List<string>(),
            AuthorKeys: dto.Authors?.Select(a => ExtractKey(a.Key)).ToList() ?? new List<string>(),
            Publishers: dto.Publishers ?? new List<string>(),
            PublishDate: dto.PublishDate,
            NumberOfPages: dto.NumberOfPages,
            CoverIds: dto.Covers?.Where(c => c > 0).ToList() ?? new List<int>(),
            CoverUrl: dto.Covers?.FirstOrDefault(c => c > 0) is int coverId
                ? $"{_options.CoverBaseUrl}/{coverId}-{_options.CoverSize.Detail}.jpg"
                : null,
            WorkKey: dto.Works?.FirstOrDefault()?.Key is string workKey
                ? ExtractKey(workKey)
                : null,
            Identifiers: new EditionIdentifiers(
                Goodreads: dto.Identifiers?.Goodreads ?? new List<string>(),
                LibraryThing: dto.Identifiers?.LibraryThing ?? new List<string>(),
                Amazon: dto.Identifiers?.Amazon ?? new List<string>(),
                Google: dto.Identifiers?.Google ?? new List<string>(),
                Wikidata: dto.Identifiers?.Wikidata ?? new List<string>()
            ),
            Contributions: dto.Contributions ?? new List<string>(),
            Languages: dto.Languages?.Select(l => ExtractKey(l.Key)).ToList() ?? new List<string>(),
            SourceRecords: dto.SourceRecords ?? new List<string>(),
            LocalIds: dto.LocalIds ?? new List<string>(),
            Type: dto.Type != null ? ExtractKey(dto.Type.Key) : null,
            FirstSentence: dto.FirstSentence?.Value,
            Classifications: dto.Classifications ?? new Dictionary<string, List<string>>(),
            InternetArchiveId: dto.Ocaid,
            LatestRevision: dto.LatestRevision,
            Revision: dto.Revision,
            Created: ParseDateTime(dto.Created?.Value),
            LastModified: ParseDateTime(dto.LastModified?.Value)
        );
    }

    public BookshelvesInfo ToBookshelvesInfo(OpenLibraryBookshelvesDto dto)
    {
        var counts = dto.Counts;
        return new BookshelvesInfo(
            WantToRead: counts.WantToRead,
            CurrentlyReading: counts.CurrentlyReading,
            AlreadyRead: counts.AlreadyRead,
            Total: counts.WantToRead + counts.CurrentlyReading + counts.AlreadyRead
        );
    }

    public RatingsInfo ToRatingsInfo(OpenLibraryRatingsDto dto)
    {
        return new RatingsInfo(
            Average: dto.Summary.Average,
            Count: dto.Summary.Count,
            Sortable: dto.Summary.Sortable,
            Distribution: new RatingDistribution(
                OneStar: dto.Counts.OneStar,
                TwoStars: dto.Counts.TwoStars,
                ThreeStars: dto.Counts.ThreeStars,
                FourStars: dto.Counts.FourStars,
                FiveStars: dto.Counts.FiveStars
            )
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
