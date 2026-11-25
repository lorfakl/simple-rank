namespace simple_rank_backend.Models;

public class ReactionHistory
{
    public int Id { get; set; }
    public string RankingId { get; set; } = string.Empty;
    public string? SharedId { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public bool IsRealUser { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
