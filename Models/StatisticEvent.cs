namespace simple_rank_backend.Models;

public class StatisticEvent
{
    public int Id { get; set; }
    public string RankingId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Value { get; set; } = 1;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
