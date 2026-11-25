using System.Text.Json.Serialization;

namespace simple_rank_backend.DTOs;

public class AuthUserMetadata
{
    [JsonPropertyName("full_name")]
    public string FullName { get; set; } = string.Empty;

    [JsonPropertyName("avatar_url")]
    public string AvatarUrl { get; set; } = string.Empty;
}

public class AuthUser
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("user_metadata")]
    public AuthUserMetadata UserMetadata { get; set; } = new();
}

