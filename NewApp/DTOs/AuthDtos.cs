using System.Text.Json.Serialization;

namespace simple_rank_backend.NewApp.DTOs;

public record SignUpRequest(string Email, string Password);
public record SignInRequest(string Email, string Password);

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

public class AuthSession
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; } = string.Empty;

    public AuthUser User { get; set; } = new();
}

public class AuthResponse
{
    public AuthSession Session { get; set; } = new();
}
