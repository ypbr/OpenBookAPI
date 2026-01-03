using Microsoft.Extensions.Options;
using OpenBookAPI.Application.Models;
using OpenBookAPI.Infrastructure.Configuration;
using OpenBookAPI.Infrastructure.Dtos;

namespace OpenBookAPI.Infrastructure.Mappers;

public class AuthorMapper
{
    private readonly OpenLibraryOptions _options;

    public AuthorMapper(IOptions<OpenLibraryOptions> options)
    {
        _options = options.Value;
    }

    public AuthorDetail ToAuthorDetail(OpenLibraryAuthorDto dto)
    {
        return new AuthorDetail(
            Key: ExtractKey(dto.Key),
            Name: dto.Name,
            Bio: ExtractBio(dto.Bio),
            BirthDate: dto.BirthDate,
            DeathDate: dto.DeathDate,
            PhotoUrl: dto.Photos?.FirstOrDefault() is int photoId
                ? $"{_options.PhotoBaseUrl}/{photoId}-{_options.CoverSize.Detail}.jpg"
                : null,
            AlternateNames: dto.AlternateNames ?? new List<string>(),
            Links: dto.Links?.Select(l => l.Url).ToList() ?? new List<string>()
        );
    }

    public AuthorSearchResult ToAuthorSearchResult(OpenLibraryAuthorSearchDto dto, int page, int limit)
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

    public AuthorSummary ToAuthorSummary(OpenLibraryAuthorSearchDocDto dto)
    {
        return new AuthorSummary(
            Key: ExtractKey(dto.Key),
            Name: dto.Name,
            BirthDate: dto.BirthDate,
            DeathDate: dto.DeathDate,
            TopWork: dto.TopWork,
            WorkCount: dto.WorkCount,
            PhotoUrl: null
        );
    }

    public AuthorWorks ToAuthorWorks(OpenLibraryAuthorWorksDto dto, int page, int limit)
    {
        var totalPages = limit > 0 ? (int)Math.Ceiling((double)dto.Size / limit) : 0;

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

    public WorkSummary ToWorkSummary(OpenLibraryWorkEntryDto dto)
    {
        int? firstPublishYear = null;
        if (!string.IsNullOrEmpty(dto.FirstPublishDate))
        {
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
                ? $"{_options.CoverBaseUrl}/{coverId}-{_options.CoverSize.Thumbnail}.jpg"
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
