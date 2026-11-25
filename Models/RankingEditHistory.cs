namespace simple_rank_backend.Models;

public class RankingEditHistory
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string RankingId { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;
    public string ActionType { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string SnapshotJson { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Ranking? Ranking { get; set; }
}
