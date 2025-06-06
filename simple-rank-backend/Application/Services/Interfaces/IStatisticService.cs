using simple_rank_backend.Application.Common;
using simple_rank_backend.DTOs.Ranking.Responses;
using simple_rank_backend.DTOs.Ranking;
using simple_rank_backend.DTOs;
using simple_rank_backend.DTOs.Statistic;

namespace simple_rank_backend.Application.Services.Interfaces
{
    public interface IStatisticService
    {
        Task<Result<RankStatisticResponse>> GetRankStatistics(string rankingId);
        Task<Result<ResponseBase>> RecordView(string rankingId);
        Task<Result<ResponseBase>> RecordReaction(ReactDto rq);


    }
}
