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

        public async Task<Result<Ranking>> GetRankingAsync(GetRankingByIdRequest rq)
        {
            var queryResult = await _supabase.Client.From<TableModels.Ranking>()
                .Where(r => r.RankingId == rq.Id)
                .Get();
            if(queryResult.Model != default(TableModels.Ranking) && queryResult.Model != null)
            {
                var ranking = new Ranking(queryResult.Model);
                return Result<Ranking>.Success(ranking, $"Successfully grabbed ranking: {rq.Id}");
            }
            else
            {
                return Result<Ranking>.Failure(Error.NullValue);
            }
        }

        public async Task<Result<List<Ranking>>> GetUserRankingsAsync(string userId)
        {
            var queryResult = await _supabase.Client.From<TableModels.Ranking>()
                .Where(r => r.Owner == userId)
                .Get();
            
            var rankings = queryResult.Models.Select(r => new Ranking(r)).ToList();
            return Result<List<Ranking>>.Success(rankings, $"Successfully pulled {rankings.Count} rankings for user");
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
