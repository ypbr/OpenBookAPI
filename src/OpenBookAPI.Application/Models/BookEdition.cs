namespace OpenBookAPI.Application.Models;

public record BookEdition(
    string Key,
    string Title,
    List<string> Isbn10,
    List<string> Isbn13,
    List<string> AuthorKeys,
    List<string> Publishers,
    string? PublishDate,
    int? NumberOfPages,
    List<int> CoverIds,
    string? CoverUrl,
    string? WorkKey,
    EditionIdentifiers Identifiers,
    List<string> Contributions,
    List<string> Languages,
    List<string> SourceRecords,
    List<string> LocalIds,
    string? Type,
    string? FirstSentence,
    Dictionary<string, List<string>> Classifications,
    string? InternetArchiveId,
    int? LatestRevision,
    int? Revision,
    DateTime? Created,
    DateTime? LastModified
);

public record EditionIdentifiers(
    List<string> Goodreads,
    List<string> LibraryThing,
    List<string> Amazon,
    List<string> Google,
    List<string> Wikidata
);
