using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpenBookAPI.Application.Interfaces;

namespace OpenBookAPI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AuthorsController : ControllerBase
{
    private readonly IAuthorService _authorService;

    public AuthorsController(IAuthorService authorService)
    {
        _authorService = authorService;
    }

    /// <summary>
    /// Search authors by name
    /// </summary>
    [HttpGet("search")]
    public async Task<IActionResult> Search(
        [FromQuery] string query,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 10)
    {
        if (string.IsNullOrWhiteSpace(query))
            return BadRequest(new { error = "Query parameter is required" });

        if (limit > 100) limit = 100;
        if (page < 1) page = 1;

        var result = await _authorService.SearchAuthorsAsync(query, page, limit);
        return Ok(result);
    }

    /// <summary>
    /// Get author details by OpenLibrary author key
    /// </summary>
    [HttpGet("{authorKey}")]
    public async Task<IActionResult> GetAuthor(string authorKey)
    {
        var author = await _authorService.GetAuthorByKeyAsync(authorKey);

        if (author == null)
            return NotFound(new { error = $"Author with key '{authorKey}' not found" });

        return Ok(author);
    }

    /// <summary>
    /// Get all works by an author
    /// </summary>
    [HttpGet("{authorKey}/works")]
    public async Task<IActionResult> GetAuthorWorks(
        string authorKey,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 10)
    {
        if (limit > 100) limit = 100;
        if (page < 1) page = 1;

        var works = await _authorService.GetAuthorWorksAsync(authorKey, page, limit);
        return Ok(works);
    }
}
