# OpenBookAPI

A .NET Core REST API that proxies and enriches data from [OpenLibrary.org](https://openlibrary.org). Built with Clean Architecture and SOLID principles.

## Features

- 📚 **Book Search** - Search books by title, author, or keyword with pagination
- 📖 **Book Details** - Get detailed information about a specific book
- 🔢 **ISBN Lookup** - Find books by ISBN-10 or ISBN-13
- ✍️ **Author Search** - Search authors by name with pagination
- 👤 **Author Details** - Get detailed author information
- 📕 **Author Works** - List all works by a specific author

## Prerequisites

- [.NET 10.0 SDK](https://dotnet.microsoft.com/download) or later
- Internet connection (for OpenLibrary API access)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/OpenBookAPI.git
cd OpenBookAPI

# Build the project
dotnet build

# Run the API
dotnet run --project src/OpenBookAPI.Api
```

The API will be available at: `http://localhost:5041`

## API Endpoints

### Books

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books/search?query={q}&page={p}&limit={l}` | Search books |
| GET | `/api/books/{workKey}` | Get book details by work key |
| GET | `/api/books/isbn/{isbn}` | Get book by ISBN (10 or 13 digits) |

### Authors

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/authors/search?query={q}&page={p}&limit={l}` | Search authors |
| GET | `/api/authors/{authorKey}` | Get author details |
| GET | `/api/authors/{authorKey}/works?page={p}&limit={l}` | Get author's works |

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | required | Search term |
| `page` | int | 1 | Page number (1-based) |
| `limit` | int | 10 | Results per page (max: 100) |

## Usage Examples

### Search Books

```bash
# Search for books by Tolkien
curl "http://localhost:5041/api/books/search?query=tolkien&page=1&limit=5"
```

Response:
```json
{
  "totalResults": 1234,
  "page": 1,
  "limit": 5,
  "totalPages": 247,
  "hasNextPage": true,
  "hasPreviousPage": false,
  "books": [
    {
      "key": "OL27479W",
      "title": "The Lord of the Rings",
      "authorNames": ["J.R.R. Tolkien"],
      "firstPublishYear": 1954,
      "coverUrl": "https://covers.openlibrary.org/b/id/8406786-M.jpg"
    }
  ]
}
```

### Get Book Details

```bash
# Get details for "The Hobbit"
curl "http://localhost:5041/api/books/OL27516W"
```

### Search by ISBN

```bash
# Search by ISBN-13
curl "http://localhost:5041/api/books/isbn/978-0618640157"

# Search by ISBN-10 (hyphens optional)
curl "http://localhost:5041/api/books/isbn/0618640150"
```

### Search Authors

```bash
# Search for authors named "Tolkien"
curl "http://localhost:5041/api/authors/search?query=tolkien&limit=3"
```

### Get Author Details

```bash
# Get J.R.R. Tolkien's details
curl "http://localhost:5041/api/authors/OL26320A"
```

### Get Author's Works

```bash
# Get all works by J.R.R. Tolkien
curl "http://localhost:5041/api/authors/OL26320A/works?page=1&limit=10"
```

## Architecture

This project follows **Clean Architecture** principles with three layers:

```
┌─────────────────────────────────────────────────────────────┐
│  OpenBookAPI.Api          (Controllers, Middleware)         │
│  - REST endpoints                                           │
│  - Exception handling                                       │
│  - Request/Response handling                                │
├─────────────────────────────────────────────────────────────┤
│  OpenBookAPI.Application  (Services, Interfaces, Models)    │
│  - Business logic                                           │
│  - Service interfaces                                       │
│  - Domain models                                            │
├─────────────────────────────────────────────────────────────┤
│  OpenBookAPI.Infrastructure (HTTP Client, DTOs, Mappers)    │
│  - OpenLibrary API communication                            │
│  - Data transfer objects                                    │
│  - Response mapping                                         │
└─────────────────────────────────────────────────────────────┘
```

### Dependency Flow

```
Api → Application ← Infrastructure
```

- **Api** depends on **Application**
- **Infrastructure** depends on **Application**
- **Application** has no external dependencies (only interfaces)

## Project Structure

```
OpenBookAPI/
├── src/
│   ├── OpenBookAPI.Api/
│   │   ├── Controllers/
│   │   │   ├── BooksController.cs
│   │   │   └── AuthorsController.cs
│   │   ├── Middleware/
│   │   │   └── ExceptionHandlingMiddleware.cs
│   │   └── Program.cs
│   │
│   ├── OpenBookAPI.Application/
│   │   ├── Interfaces/
│   │   │   ├── IBookService.cs
│   │   │   ├── IAuthorService.cs
│   │   │   └── IOpenLibraryClient.cs
│   │   ├── Models/
│   │   │   ├── BookSearchResult.cs
│   │   │   ├── BookDetail.cs
│   │   │   ├── AuthorDetail.cs
│   │   │   └── ...
│   │   └── Services/
│   │       ├── BookService.cs
│   │       └── AuthorService.cs
│   │
│   └── OpenBookAPI.Infrastructure/
│       ├── Dtos/
│       │   ├── OpenLibrarySearchDto.cs
│       │   ├── OpenLibraryWorkDto.cs
│       │   └── ...
│       ├── Http/
│       │   └── OpenLibraryClient.cs
│       ├── Mappers/
│       │   ├── BookMapper.cs
│       │   └── AuthorMapper.cs
│       └── Exceptions/
│           └── OpenLibraryException.cs
│
├── .github/
│   └── copilot-instructions.md
├── requests.http
├── README.md
└── OpenBookAPI.sln
```

## Configuration

The API uses the following default configuration in `appsettings.json`:

```json
{
  "OpenLibrary": {
    "BaseUrl": "https://openlibrary.org"
  }
}
```

## Rate Limiting

This API implements client-side rate limiting to comply with [OpenLibrary's API limits](https://github.com/internetarchive/openlibrary/blob/master/docker/nginx.conf):

| Limit Type | Rate | Description |
|------------|------|-------------|
| API Limit | 180 requests/minute | 3 requests per second |
| Burst | 5 requests | Initial burst capacity |

The rate limiter uses a **Token Bucket** algorithm:
- Allows burst of up to 5 requests
- Replenishes 3 tokens per second
- Queues up to 100 requests when limit is reached
- Returns HTTP 429 (Too Many Requests) if queue is full

## Testing with REST Client

You can use the included `requests.http` file with the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) VS Code extension for quick API testing.

## Error Handling

The API returns standardized error responses using `ProblemDetails`:

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "Book with key 'OL123456W' was not found"
}
```

## OpenLibrary API Reference

This API uses the following OpenLibrary endpoints:

| Endpoint | Usage |
|----------|-------|
| `https://openlibrary.org/search.json` | Book search |
| `https://openlibrary.org/works/{olid}.json` | Book details |
| `https://openlibrary.org/isbn/{isbn}.json` | ISBN lookup |
| `https://openlibrary.org/search/authors.json` | Author search |
| `https://openlibrary.org/authors/{olid}.json` | Author details |
| `https://openlibrary.org/authors/{olid}/works.json` | Author works |
| `https://covers.openlibrary.org/b/id/{id}-{S\|M\|L}.jpg` | Cover images |

For more information, visit [OpenLibrary API Documentation](https://openlibrary.org/developers/api).

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for detailed development guidelines.

## License

This project is licensed under the MIT License.

## Acknowledgments

- [OpenLibrary.org](https://openlibrary.org) for providing the free book data API
- [Internet Archive](https://archive.org) for maintaining OpenLibrary
