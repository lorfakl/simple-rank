using simple_rank_backend.Application.Common;
using simple_rank_backend.DTOs.Ranking;
using simple_rank_backend.Models;

namespace simple_rank_backend.Application.Services.Interfaces
{
    public interface IRankService
    {
        Task<Result> CreateRankingAsync(CreateRankingRequest rq, string ownerId);
        Task<Result> UpdateRankingAsync(UpdateRankingRequest rq);
        Task<Result> DeleteRankingAsync(GetRankingByIdRequest rq);
        Task<Result<Ranking>> GetRankingAsync(GetRankingByIdRequest rq);
        Task<Result<List<Ranking>>> GetUserRankingsAsync(string userId);
        //Task<Result<List<Ranking>>> GetPublicRankingsAsync(GetRankingsRequest rq);
        Task<Result> UpdateRankItem(UpdateRankItemRequest rq);
        Task<Result> DeleteRankItem(DeleteRankItemRequest rq);
        Task<Result> UpdateRankItemPlacement(UpdateRankItemPlacementRequest rq);
    }

}

