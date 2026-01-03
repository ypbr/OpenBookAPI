using Microsoft.AspNetCore.Mvc;
using OpenBookAPI.Application.Interfaces;

namespace OpenBookAPI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly IBookService _bookService;

    public BooksController(IBookService bookService)
    {
        _bookService = bookService;
    }

    /// <summary>
    /// Search books by query
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

        var result = await _bookService.SearchBooksAsync(query, page, limit);
        return Ok(result);
    }

    /// <summary>
    /// Get book details by OpenLibrary work key
    /// </summary>
    [HttpGet("{workKey}")]
    public async Task<IActionResult> GetBook(string workKey)
    {
        var book = await _bookService.GetBookByKeyAsync(workKey);

        if (book == null)
            return NotFound(new { error = $"Book with key '{workKey}' not found" });

        return Ok(book);
    }

    /// <summary>
    /// Get book edition by ISBN (10 or 13 digit)
    /// </summary>
    [HttpGet("isbn/{isbn}")]
    public async Task<IActionResult> GetBookByIsbn(string isbn)
    {
        if (string.IsNullOrWhiteSpace(isbn))
            return BadRequest(new { error = "ISBN is required" });

        var edition = await _bookService.GetBookByIsbnAsync(isbn);

        if (edition == null)
            return NotFound(new { error = $"Book with ISBN '{isbn}' not found" });

        return Ok(edition);
    }
}
