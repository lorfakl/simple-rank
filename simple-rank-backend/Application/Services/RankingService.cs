using simple_rank_backend.Application.Common;
using simple_rank_backend.Application.Services.Interfaces;
using simple_rank_backend.DTOs.Ranking;
using simple_rank_backend.Models;

namespace simple_rank_backend.Application.Services
{
    public class RankingService : IRankService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly SupabaseService _supabase;

        public RankingService(IHttpContextAccessor httpContextAccessor, SupabaseService supabaseService)
        {
            _httpContextAccessor = httpContextAccessor;
            _supabase = supabaseService;
        }

        public async Task<Result> CreateRankingAsync(CreateRankingRequest rq, string ownerId)
        {
            string userId = ownerId;
            TableModels.Ranking newRanking = new TableModels.Ranking(rq, userId);
            var result = await _supabase.Client.From<TableModels.Ranking>().Insert(newRanking);

            if (result?.ResponseMessage?.IsSuccessStatusCode == true)
            {
                return Result.Success($"Successfully created new rank {rq.Title}");
            }
            else
            {
                return Result.Failure(new Error(
                    Code: result?.ResponseMessage?.StatusCode.ToString() ?? "Unknown",
                    Message: result?.ResponseMessage?.ToString() ?? "No response message"));
            }
        }

        public Task<Result> DeleteRankingAsync(GetRankingByIdRequest rq)
        {
            throw new NotImplementedException();
        }

        public Task<Result> DeleteRankItem(DeleteRankItemRequest rq)
        {
            throw new NotImplementedException();
        }

        public Task<Result<Ranking>> GetRankingAsync(GetRankingByIdRequest rq)
        {
            throw new NotImplementedException();
        }

        public Task<Result<List<Ranking>>> GetUserRankingsAsync(string userId)
        {
            throw new NotImplementedException();
        }

        public Task<Result> UpdateRankingAsync(UpdateRankingRequest rq)
        {
            throw new NotImplementedException();
        }

        public Task<Result> UpdateRankItem(UpdateRankItemRequest rq)
        {
            throw new NotImplementedException();
        }

        public Task<Result> UpdateRankItemPlacement(UpdateRankItemPlacementRequest rq)
        {
            throw new NotImplementedException();
        }
    }
}
