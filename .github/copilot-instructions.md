# OpenBookAPI - Copilot Instructions

## Project Overview

A .NET Core REST API that proxies and enriches data from [OpenLibrary.org](https://openlibrary.org). No local database - all data is fetched from OpenLibrary's public API.

## Architecture (Clean Architecture + SOLID)

```
┌─────────────────────────────────────────────────────────────┐
│  OpenBookAPI.Api          (Controllers, Middleware)         │
├─────────────────────────────────────────────────────────────┤
│  OpenBookAPI.Application  (Services, Interfaces, Models)    │
├─────────────────────────────────────────────────────────────┤
│  OpenBookAPI.Infrastructure (HTTP Client, DTOs, Mappers)    │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

- **Api**: Controllers receive requests, return responses. No business logic.
- **Application**: Orchestrates use cases, defines interfaces (ports). Does NOT know about HTTP details.
- **Infrastructure**: Implements HTTP communication with OpenLibrary. Request builders, response mappers.

### Dependency Rule

Dependencies flow inward: `Api → Application ← Infrastructure`
Application layer has NO reference to Infrastructure - only interfaces.

## Key Conventions

### Data Types

- Use `record` types for all DTOs and models (immutable, value-based equality)
- Infrastructure DTOs: `OpenLibrary{Entity}Dto` with `[JsonPropertyName]` attributes
- Application Models: Clean records without JSON attributes

```csharp
// Infrastructure DTO (with JSON mapping)
public record OpenLibrarySearchDto(
    [property: JsonPropertyName("numFound")] int NumFound,
    [property: JsonPropertyName("docs")] List<OpenLibrarySearchDocDto> Docs
);

// Application Model (clean)
public record BookSearchResult(
    int TotalResults,
    int Page,
    int Limit,
    List<BookSummary> Books
);
```

### Pagination

All search endpoints return paginated results:

```csharp
public record BookSearchResult(
    int TotalResults,
    int Page,
    int Limit,
    int TotalPages,
    bool HasNextPage,
    bool HasPreviousPage,
    List<BookSummary> Books
);
```

### Naming

- Interfaces: `I{Name}` prefix (e.g., `IBookService`, `IOpenLibraryClient`)
- Infrastructure DTOs: `OpenLibrary{Entity}Dto`
- Application Models: `{Entity}Detail`, `{Entity}Summary`, `{Entity}SearchResult`
- Mappers: `{Entity}Mapper` with static methods

### Dependency Injection

Register all services in `Program.cs` using extension methods:

```csharp
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);
```

### HTTP Client Pattern

Use `IHttpClientFactory` with named client "OpenLibrary". Configure base address and default headers in `Infrastructure` layer.

### Error Handling

- Wrap OpenLibrary errors in custom exceptions (`OpenLibraryException`)
- Use global exception middleware in Api layer
- Return `ProblemDetails` for all error responses

### Configuration (Options Pattern)

All settings are configurable via `appsettings.json`:

```json
{
  "OpenLibrary": {
    "BaseUrl": "https://openlibrary.org",
    "CoverBaseUrl": "https://covers.openlibrary.org/b/id",
    "PhotoBaseUrl": "https://covers.openlibrary.org/a/id",
    "UserAgent": "OpenBookAPI/1.0",
    "CoverSize": {
      "Thumbnail": "M",
      "Detail": "L"
    },
    "RateLimit": {
      "TokenLimit": 5,
      "TokensPerPeriod": 3,
      "ReplenishmentPeriodSeconds": 1,
      "QueueLimit": 100
    }
  }
}
```

Use `IOptions<OpenLibraryOptions>` pattern for accessing configuration.

## Project Structure

```
src/
├── OpenBookAPI.Api/
│   ├── Controllers/
│   ├── Middleware/
│   └── Program.cs
├── OpenBookAPI.Application/
│   ├── Interfaces/
│   ├── Services/
│   ├── Models/
│   └── Extensions/
└── OpenBookAPI.Infrastructure/
    ├── Configuration/
    ├── Http/
    ├── Dtos/
    ├── Mappers/
    ├── Exceptions/
    └── Extensions/
```

## OpenLibrary API Endpoints

```
Books:    https://openlibrary.org/works/{olid}.json
Authors:  https://openlibrary.org/authors/{olid}.json
Search:   https://openlibrary.org/search.json?q={query}&offset={offset}&limit={limit}
Covers:   https://covers.openlibrary.org/b/id/{cover_id}-{S|M|L}.jpg
```

## Build & Run

```bash
dotnet build
dotnet run --project src/OpenBookAPI.Api
```

API runs at: `http://localhost:5041`

## Testing Endpoints

```http
GET /api/books/search?query=tolkien&page=1&limit=5
GET /api/books/{workKey}
GET /api/books/isbn/{isbn}
GET /api/authors/search?query=tolkien&page=1&limit=5
GET /api/authors/{authorKey}
GET /api/authors/{authorKey}/works?page=1&limit=10
```

---

## Related Instructions

- **Mobile App Development**: See [copilot-instructions-mobile.md](./copilot-instructions-mobile.md) for React Native specific guidelines