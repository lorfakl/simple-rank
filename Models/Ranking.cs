namespace simple_rank_backend.Models;

public class Ranking
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string OwnerId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public bool IsShared { get; set; }
    public bool IsPinned { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    public DateTime? PinnedTime { get; set; }

    public AppUser? Owner { get; set; }
    public List<RankItem> Items { get; set; } = [];
    public ShareableLink? ShareableLink { get; set; }
}
