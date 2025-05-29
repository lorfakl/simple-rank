namespace simple_rank_backend.DTOs.Ranking
{
    public class RankItemDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public uint Rank { get; set; } = 0;

        public RankItemDto() { }

        public RankItemDto(string name, string description, uint rank)
        {
            Name = name;
            Description = description;
            Rank = rank;
        }
    }
}
