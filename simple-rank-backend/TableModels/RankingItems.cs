using simple_rank_backend.Application.Services;
using simple_rank_backend.DTOs.Ranking;
using simple_rank_backend.Models;
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace simple_rank_backend.TableModels
{
    [Table("RankItems")]
    public class RankingItems : BaseModel
    {
        [PrimaryKey("id")]
        public string ItemId { get; set; } = string.Empty;


        [Column("ranking_id")]
        [Reference(typeof(Ranking))]
        public string RankingId { get; set; } = string.Empty;

        [Column("item_description")]
        public string Description { get; set; } = string.Empty;

        [Column("item_name")]
        public string Name { get; set; } = string.Empty;

        [Column("order")]
        public uint Rank { get; set; } = 0;


        public RankingItems() { }

        public RankingItems(string itemId, string rankingId, string name, string description, uint rank)
        {
            ItemId = itemId;
            RankingId = rankingId;
            Name = name;
            Description = description;
            Rank = rank;
        }

        public RankingItems(RankItemDto dto, string rankingId)
        {
            RankingId = rankingId;
            ItemId = dto.Id;
            Name = dto.Name;
            Description = dto.Description;
            Rank = dto.Rank;
        }

        public RankingItems(RankItem item, string rankingId)
        {
            ItemId = item.ItemId;
            RankingId = rankingId;
            Name = item.Name;
            Description = item.Description;
            Rank = item.Rank;
        }
    }
}
