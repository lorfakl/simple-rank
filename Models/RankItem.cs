namespace simple_rank_backend.Models;

public class RankItem
{
    public string ItemId { get; set; } = Guid.NewGuid().ToString();
    public string RankingId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public uint Rank { get; set; }

    public Ranking? Ranking { get; set; }
}
