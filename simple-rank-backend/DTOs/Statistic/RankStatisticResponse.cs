namespace simple_rank_backend.DTOs.Statistic
{
    public class RankStatisticResponse
    {
        public int Views { get; set; } 
        public int Clones { get; set; }
        public int LikeCount { get; set; }
        public int LoveCount { get; set; }
        public int LaughCount {  get; set; } 
        public int WowCount { get; set; }
        public int SadCount { get; set; }
        public int AngryCount { get; set; }

        public RankStatisticResponse() { }

        public RankStatisticResponse(TableModels.Statistics statistics)
        { 
            Views = statistics.Views;
            Clones = statistics.Clones;
            LikeCount = statistics.LikeReactions;
            LoveCount = statistics.LoveReactions;
            LaughCount = statistics.LaughReactions;
            WowCount = statistics.WowReactions;
            SadCount = statistics.SadReactions;
            AngryCount = statistics.AngryReactions;
        }
    }
}
