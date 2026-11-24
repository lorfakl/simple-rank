namespace simple_rank_backend.NewApp.DTOs;

public enum Statistics
{
    LIKE,
    LOVE,
    LAUGH,
    WOW,
    SAD,
    ANGRY,
    VIEW,
    CLONE
}

public class ReactDto
{
    public string ReactionId { get; set; } = string.Empty;
    public string RankingId { get; set; } = string.Empty;
    public bool IsShared { get; set; }
}

public class RankStatisticResponse
{
    public Dictionary<Statistics, int> Statistics { get; set; } = [];
}

public class UsersCountResponse
{
    public int TotalCount { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class RankingsCountResponse
{
    public int TotalCount { get; set; }
    public string Message { get; set; } = string.Empty;
}
