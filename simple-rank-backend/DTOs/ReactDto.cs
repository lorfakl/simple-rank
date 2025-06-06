namespace simple_rank_backend.DTOs
{
    public enum RankingReaction
    {
        like_reactions = 1,
        love_reactions = 2,
        laugh_reactions = 3,
        wow_reactions = 4,
        sad_reactions = 5,
        angry_reactions = 6
    }

    public class ReactDto
    {
        public int ReactionId { get; set; }
        public string RankingId { get; set; }
    }
}
