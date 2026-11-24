namespace simple_rank_backend.NewApp.Models;

public class UserMetadata
{
    public string UserId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

    public AppUser? User { get; set; }
}
