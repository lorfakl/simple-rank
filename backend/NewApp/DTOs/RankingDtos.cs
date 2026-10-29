namespace simple_rank_backend.NewApp.DTOs;

public class RankItemDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public uint Rank { get; set; }
}

public class CreateRankingRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public RankItemDto[] Items { get; set; } = [];
    public bool IsPublic { get; set; }
}

public class UpdateRankingRequest
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<RankItemDto> Items { get; set; } = [];
    public bool IsPublic { get; set; }
}

public class CreateRankingItemRequest
{
    public RankItemDto Item { get; set; } = new();
    public string RankingId { get; set; } = string.Empty;
}

public class DeleteRankItemRequest
{
    public string RankingId { get; set; } = string.Empty;
    public string RankItemId { get; set; } = string.Empty;
}

public class UpdateRankItemPlacementRequest
{
    public string RankingId { get; set; } = string.Empty;
    public Dictionary<string, int> ItemIdToRank { get; set; } = [];
}

public class PinRankingRequest
{
    public string RankingId { get; set; } = string.Empty;
    public bool PinOperation { get; set; }
}

public class ShareableLinkResponse
{
    public string ShareableId { get; set; } = string.Empty;
}

public class CreatedByDto
{
    public string UserId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
}

public class RankingResponse
{
    public string Id { get; set; } = string.Empty;
    public string Owner { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<RankItemOutputDto> Items { get; set; } = [];
    public uint ItemCount { get; set; }
    public DateTime LastUpdated { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? PinnedTime { get; set; }
    public bool IsPublic { get; set; }
    public bool IsShared { get; set; }
    public bool IsPinned { get; set; }
    public CreatedByDto CreatedBy { get; set; } = new();
}

public class RankItemOutputDto
{
    public string ItemId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public uint Rank { get; set; }
}

public class CreateRankingResponse
{
    public string Id { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
