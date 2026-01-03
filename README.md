# OpenBookAPI

A .NET Core REST API that proxies and enriches data from [OpenLibrary.org](https://openlibrary.org).

## Quick Start

```bash
# Build
dotnet build

# Run
dotnet run --project src/OpenBookAPI.Api

# Test (with REST Client extension or curl)
curl "http://localhost:5041/api/books/search?query=tolkien&limit=3"
```

## API Endpoints

| Method | Endpoint                                         | Description        |
| ------ | ------------------------------------------------ | ------------------ |
| GET    | `/api/books/search?query={q}&page={p}&limit={l}` | Search books       |
| GET    | `/api/books/{workKey}`                           | Get book details   |
| GET    | `/api/authors/{authorKey}`                       | Get author details |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  OpenBookAPI.Api          (Controllers, DTOs)               │
├─────────────────────────────────────────────────────────────┤
│  OpenBookAPI.Application  (Services, Interfaces)            │
├─────────────────────────────────────────────────────────────┤
│  OpenBookAPI.Infrastructure (HTTP Client, Request Builders) │
└─────────────────────────────────────────────────────────────┘
```

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for detailed development guidelines.
