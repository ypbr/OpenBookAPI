using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenBookAPI.Infrastructure.Dtos;

public record OpenLibraryWorkDto(
    [property: JsonPropertyName("key")] string Key,
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("description")] object? Description,
    [property: JsonPropertyName("subjects")] List<string>? Subjects,
    [property: JsonPropertyName("subject_places")] List<string>? SubjectPlaces,
    [property: JsonPropertyName("subject_people")] List<string>? SubjectPeople,
    [property: JsonPropertyName("subject_times")] List<string>? SubjectTimes,
    [property: JsonPropertyName("authors")] List<OpenLibraryAuthorReferenceDto>? Authors,
    [property: JsonPropertyName("covers")] List<int>? Covers,
    [property: JsonPropertyName("type")] OpenLibraryKeyDto? Type,
    [property: JsonPropertyName("location")] string? Location,
    [property: JsonPropertyName("latest_revision")] int? LatestRevision,
    [property: JsonPropertyName("revision")] int? Revision,
    [property: JsonPropertyName("created")] OpenLibraryDateTimeDto? Created,
    [property: JsonPropertyName("last_modified")] OpenLibraryDateTimeDto? LastModified
);

public record OpenLibraryAuthorReferenceDto(
    [property: JsonPropertyName("author")] OpenLibraryKeyDto? Author,
    [property: JsonPropertyName("type")]
    [property: JsonConverter(typeof(FlexibleKeyDtoConverter))]
    OpenLibraryKeyDto? Type
);

public record OpenLibraryKeyDto(
    [property: JsonPropertyName("key")] string Key
);

public record OpenLibraryDateTimeDto(
    [property: JsonPropertyName("type")] string Type,
    [property: JsonPropertyName("value")] string Value
);

/// <summary>
/// Handles OpenLibrary's inconsistent type field that can be either:
/// - An object: {"key": "/type/author_role"}
/// - A string: "/type/author_role"
/// </summary>
public class FlexibleKeyDtoConverter : JsonConverter<OpenLibraryKeyDto?>
{
    public override OpenLibraryKeyDto? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
        {
            return null;
        }

        if (reader.TokenType == JsonTokenType.String)
        {
            // Handle string format: "/type/author_role"
            var keyValue = reader.GetString();
            return keyValue != null ? new OpenLibraryKeyDto(keyValue) : null;
        }

        if (reader.TokenType == JsonTokenType.StartObject)
        {
            // Handle object format: {"key": "/type/author_role"}
            using var doc = JsonDocument.ParseValue(ref reader);
            var root = doc.RootElement;
            if (root.TryGetProperty("key", out var keyElement))
            {
                var keyValue = keyElement.GetString();
                return keyValue != null ? new OpenLibraryKeyDto(keyValue) : null;
            }
            return null;
        }

        throw new JsonException($"Unexpected token type: {reader.TokenType}");
    }

    public override void Write(Utf8JsonWriter writer, OpenLibraryKeyDto? value, JsonSerializerOptions options)
    {
        if (value == null)
        {
            writer.WriteNullValue();
        }
        else
        {
            writer.WriteStartObject();
            writer.WriteString("key", value.Key);
            writer.WriteEndObject();
        }
    }
}
