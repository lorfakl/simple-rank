namespace simple_rank_backend.Models;

public class ShareableLink
{
    public string SharedId { get; set; } = Guid.NewGuid().ToString("N");
    public string RankingId { get; set; } = string.Empty;

    public Ranking? Ranking { get; set; }
}
