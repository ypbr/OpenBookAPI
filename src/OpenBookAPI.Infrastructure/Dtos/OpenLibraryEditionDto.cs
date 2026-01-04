using System.Text.Json.Serialization;

namespace OpenBookAPI.Infrastructure.Dtos;

public record OpenLibraryEditionDto(
    [property: JsonPropertyName("key")] string Key,
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("isbn_10")] List<string>? Isbn10,
    [property: JsonPropertyName("isbn_13")] List<string>? Isbn13,
    [property: JsonPropertyName("authors")] List<OpenLibraryKeyDto>? Authors,
    [property: JsonPropertyName("publishers")] List<string>? Publishers,
    [property: JsonPropertyName("publish_date")] string? PublishDate,
    [property: JsonPropertyName("number_of_pages")] int? NumberOfPages,
    [property: JsonPropertyName("covers")] List<int>? Covers,
    [property: JsonPropertyName("works")] List<OpenLibraryKeyDto>? Works,
    [property: JsonPropertyName("identifiers")] OpenLibraryIdentifiersDto? Identifiers,
    [property: JsonPropertyName("contributions")] List<string>? Contributions,
    [property: JsonPropertyName("languages")] List<OpenLibraryKeyDto>? Languages,
    [property: JsonPropertyName("source_records")] List<string>? SourceRecords,
    [property: JsonPropertyName("local_id")] List<string>? LocalIds,
    [property: JsonPropertyName("type")] OpenLibraryKeyDto? Type,
    [property: JsonPropertyName("first_sentence")] OpenLibraryTextValueDto? FirstSentence,
    [property: JsonPropertyName("classifications")] Dictionary<string, List<string>>? Classifications,
    [property: JsonPropertyName("ocaid")] string? Ocaid,
    [property: JsonPropertyName("latest_revision")] int? LatestRevision,
    [property: JsonPropertyName("revision")] int? Revision,
    [property: JsonPropertyName("created")] OpenLibraryDateTimeDto? Created,
    [property: JsonPropertyName("last_modified")] OpenLibraryDateTimeDto? LastModified
);

public record OpenLibraryIdentifiersDto(
    [property: JsonPropertyName("goodreads")] List<string>? Goodreads,
    [property: JsonPropertyName("librarything")] List<string>? LibraryThing,
    [property: JsonPropertyName("amazon")] List<string>? Amazon,
    [property: JsonPropertyName("google")] List<string>? Google,
    [property: JsonPropertyName("wikidata")] List<string>? Wikidata
);

public record OpenLibraryTextValueDto(
    [property: JsonPropertyName("type")] string? Type,
    [property: JsonPropertyName("value")] string? Value
);
