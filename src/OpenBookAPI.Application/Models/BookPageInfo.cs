namespace OpenBookAPI.Application.Models;

/// <summary>
/// Page count information for a work, extracted from its editions
/// </summary>
public record BookPageInfo(
    int? PageCount,
    string? Source
);
