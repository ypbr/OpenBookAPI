using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpenBookAPI.Application.Interfaces;

namespace OpenBookAPI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
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
    /// Get book details by OpenLibrary book key (editions)
    /// </summary>
    [HttpGet("{bookKey}")]
    public async Task<IActionResult> GetBook(string bookKey)
    {
        var book = await _bookService.GetBookByKeyAsync(bookKey);

        if (book == null)
            return NotFound(new { error = $"Book with key '{bookKey}' not found" });

        return Ok(book);
    }

    /// <summary>
    /// Get work details by OpenLibrary work key
    /// </summary>
    [HttpGet("works/{workKey}")]
    public async Task<IActionResult> GetWork(string workKey)
    {
        var work = await _bookService.GetWorkByKeyAsync(workKey);

        if (work == null)
            return NotFound(new { error = $"Work with key '{workKey}' not found" });

        return Ok(work);
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

    /// <summary>
    /// Get bookshelves statistics for a work (want to read, currently reading, already read counts)
    /// </summary>
    [HttpGet("{workKey}/bookshelves")]
    public async Task<IActionResult> GetBookshelves(string workKey)
    {
        var bookshelves = await _bookService.GetBookshelvesAsync(workKey);

        if (bookshelves == null)
            return NotFound(new { error = $"Bookshelves for work '{workKey}' not found" });

        return Ok(bookshelves);
    }

    /// <summary>
    /// Get ratings for a work (average rating and distribution)
    /// </summary>
    [HttpGet("{workKey}/ratings")]
    public async Task<IActionResult> GetRatings(string workKey)
    {
        var ratings = await _bookService.GetRatingsAsync(workKey);

        if (ratings == null)
            return NotFound(new { error = $"Ratings for work '{workKey}' not found" });

        return Ok(ratings);
    }
}
