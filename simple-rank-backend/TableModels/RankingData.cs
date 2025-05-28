using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace simple_rank_backend.TableModels
{
    [Table("RankingItems")]
    public class RankingData: BaseModel
    {
        [PrimaryKey("id")]
        public string ItemId { get; set; } = string.Empty;

        [Column("ranking_id")]
        public string RankingId { get; set; } = string.Empty;

        [Column("item_description")]
        public string Description { get; set; } = string.Empty;

        [Column("item_name")]
        public string Name { get; set; } = string.Empty;

        [Column("order")]
        public uint Rank { get; set; } = 0;
    }
}
