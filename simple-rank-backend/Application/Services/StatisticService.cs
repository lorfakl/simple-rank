using simple_rank_backend.Application.Common;
using simple_rank_backend.Application.Services.Interfaces;
using simple_rank_backend.DTOs;
using simple_rank_backend.DTOs.Statistic;
using Supabase;
using Supabase.Interfaces;

namespace simple_rank_backend.Application.Services
{
    public class StatisticService : IStatisticService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IUserCacheService _userCache;
        private readonly Client _supabase;

        public StatisticService(IHttpContextAccessor httpAccessor, IUserCacheService userCache, Client client)
        {
            _httpContextAccessor = httpAccessor;
            _userCache = userCache;
            _supabase = client;
        }

        public async Task<Result<RankStatisticResponse>> GetRankStatistics(string rankingId)
        {
            var result = await _supabase.From<TableModels.Statistics>()
                .Where(s => s.Id == rankingId)
                .Get();

            if (result.ResponseMessage.IsSuccessStatusCode)
            {
                if (result.Models.Count == 0) 
                { 
                    var stats = new TableModels.Statistics(rankingId);

                    var initalInsert = await _supabase.From<TableModels.Statistics>().Insert(model: stats);

                    return Result<RankStatisticResponse>.Success(new RankStatisticResponse());
                }

                return Result<RankStatisticResponse>.Success(new RankStatisticResponse(result.Model));
                
            }

            Error supabaseError = await Error.SupabaseError(result.ResponseMessage, "Error getting stat");
            return Result<RankStatisticResponse>.Failure(supabaseError);

        }

        public async Task<Result<ResponseBase>> RecordReaction(ReactDto rq)
        {
            RankingReaction columnName =  (RankingReaction)rq.ReactionId;

            var result = await _supabase.Rpc("increment_statistics_column", new { p_id = rq.RankingId, p_column_name = columnName.ToString() });

            if (!result.ResponseMessage.IsSuccessStatusCode)
            {
                Error supabaseError = await Error.SupabaseError(result.ResponseMessage, "Error recording stat");
                return Result<ResponseBase>.Failure(supabaseError);
            }


            var updateResult = await _supabase.From<TableModels.Statistics>()
                .Where(s => s.Id == rq.RankingId)
                .Set(s => s.LastUpdate, DateTime.UtcNow)
                .Update();

            if(!updateResult.ResponseMessage.IsSuccessStatusCode)
            {
                Error supabaseError = await Error.SupabaseError(result.ResponseMessage, "Error recording stat");
                return Result<ResponseBase>.Failure(supabaseError);
            }

            ResponseBase response = new ResponseBase("Successfully recorded view");
            return Result<ResponseBase>.Success(response);
        }

        public async Task<Result<ResponseBase>> RecordView(string rankingId)
        {
            var result = await _supabase.Rpc("increment_statistics_column", new { p_id = rankingId, p_column_name = "views" });

            if (!result.ResponseMessage.IsSuccessStatusCode)
            {
                Error supabaseError = await Error.SupabaseError(result.ResponseMessage, "Error recording stat");
                return Result<ResponseBase>.Failure(supabaseError);
            }


            var updateResult = await _supabase.From<TableModels.Statistics>()
                .Where(s => s.Id == rankingId)
                .Set(s => s.LastUpdate, DateTime.UtcNow)
                .Update();

            if (!updateResult.ResponseMessage.IsSuccessStatusCode)
            {
                Error supabaseError = await Error.SupabaseError(result.ResponseMessage, "Error recording stat");
                return Result<ResponseBase>.Failure(supabaseError);
            }

            ResponseBase response = new ResponseBase("Successfully recorded view");
            return Result<ResponseBase>.Success(response);
        }
    }
}
