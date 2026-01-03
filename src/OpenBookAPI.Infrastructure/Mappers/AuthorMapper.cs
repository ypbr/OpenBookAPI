using OpenBookAPI.Application.Models;
using OpenBookAPI.Infrastructure.Dtos;

namespace OpenBookAPI.Infrastructure.Mappers;

public static class AuthorMapper
{
    private const string PhotoBaseUrl = "https://covers.openlibrary.org/a/id";
    private const string CoverBaseUrl = "https://covers.openlibrary.org/b/id";

    public static AuthorDetail ToAuthorDetail(OpenLibraryAuthorDto dto)
    {
        return new AuthorDetail(
            Key: ExtractKey(dto.Key),
            Name: dto.Name,
            Bio: ExtractBio(dto.Bio),
            BirthDate: dto.BirthDate,
            DeathDate: dto.DeathDate,
            PhotoUrl: dto.Photos?.FirstOrDefault() is int photoId
                ? $"{PhotoBaseUrl}/{photoId}-L.jpg"
                : null,
            AlternateNames: dto.AlternateNames ?? new List<string>(),
            Links: dto.Links?.Select(l => l.Url).ToList() ?? new List<string>()
        );
    }

    public static AuthorSearchResult ToAuthorSearchResult(OpenLibraryAuthorSearchDto dto, int page, int limit)
    {
        var totalPages = limit > 0 ? (int)Math.Ceiling((double)dto.NumFound / limit) : 0;

        return new AuthorSearchResult(
            TotalResults: dto.NumFound,
            Page: page,
            Limit: limit,
            TotalPages: totalPages,
            HasNextPage: page < totalPages,
            HasPreviousPage: page > 1,
            Authors: dto.Docs.Select(ToAuthorSummary).ToList()
        );
    }

    public static AuthorSummary ToAuthorSummary(OpenLibraryAuthorSearchDocDto dto)
    {
        return new AuthorSummary(
            Key: ExtractKey(dto.Key),
            Name: dto.Name,
            BirthDate: dto.BirthDate,
            DeathDate: dto.DeathDate,
            TopWork: dto.TopWork,
            WorkCount: dto.WorkCount,
            PhotoUrl: null // Search results don't include photo IDs
        );
    }

    public static AuthorWorks ToAuthorWorks(OpenLibraryAuthorWorksDto dto, int page, int limit)
    {
        var totalPages = limit > 0 ? (int)Math.Ceiling((double)dto.Size / limit) : 0;

        // Calculate pagination for entries
        var skip = (page - 1) * limit;
        var pagedEntries = dto.Entries.Skip(skip).Take(limit).ToList();

        return new AuthorWorks(
            TotalResults: dto.Size,
            Page: page,
            Limit: limit,
            TotalPages: totalPages,
            HasNextPage: page < totalPages,
            HasPreviousPage: page > 1,
            Works: pagedEntries.Select(ToWorkSummary).ToList()
        );
    }

    public static WorkSummary ToWorkSummary(OpenLibraryWorkEntryDto dto)
    {
        int? firstPublishYear = null;
        if (!string.IsNullOrEmpty(dto.FirstPublishDate))
        {
            // Try to extract year from various date formats
            var yearMatch = System.Text.RegularExpressions.Regex.Match(dto.FirstPublishDate, @"\d{4}");
            if (yearMatch.Success && int.TryParse(yearMatch.Value, out var year))
            {
                firstPublishYear = year;
            }
        }

        return new WorkSummary(
            Key: ExtractKey(dto.Key),
            Title: dto.Title,
            FirstPublishYear: firstPublishYear,
            CoverUrl: dto.Covers?.FirstOrDefault() is int coverId
                ? $"{CoverBaseUrl}/{coverId}-M.jpg"
                : null,
            Subjects: dto.Subjects?.Take(5).ToList() ?? new List<string>()
        );
    }

    private static string ExtractKey(string fullKey)
    {
        return fullKey.Split('/').LastOrDefault() ?? fullKey;
    }

    private static string? ExtractBio(object? bio)
    {
        if (bio == null) return null;

        if (bio is string str) return str;

        if (bio is System.Text.Json.JsonElement element)
        {
            if (element.ValueKind == System.Text.Json.JsonValueKind.String)
                return element.GetString();

            if (element.TryGetProperty("value", out var valueElement))
                return valueElement.GetString();
        }

        return bio.ToString();
    }
}
