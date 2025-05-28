using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace simple_rank_backend.TableModels
{
    [Table("Ranking")]
    public class Ranking: BaseModel
    {
        [PrimaryKey("ranking_id")]
        public string RankingId { get; set; } = string.Empty;

        [Column("owner")]  
        public string Owner { get; set; } = string.Empty;

        [Column("ranking_name")]
        public string Name { get; set; } = string.Empty;

        [Column("ranking_desc")]
        public string Description { get; set; } = string.Empty;

        [Column("item_count")]
        public uint ItemCount { get; set; } = 0;

        [Column("last_updated")]
        public DateTime LastUpdated { get; set; } = DateTime.Now;


    }
}
