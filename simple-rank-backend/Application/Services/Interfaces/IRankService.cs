﻿using simple_rank_backend.Application.Common;
using simple_rank_backend.DTOs.Ranking;
using simple_rank_backend.DTOs.Ranking.Responses;
using simple_rank_backend.Models;

namespace simple_rank_backend.Application.Services.Interfaces
{
    public interface IRankService
    {
        Task<Result<CreateRankingResponse>> CreateRankingAsync(CreateRankingRequest rq, string ownerId);
        Task<Result> UpdateRankingAsync(UpdateRankingRequest rq);
        Task<Result> UpdateBasicRankingInfoAsync(UpdateRankingRequest rq);
        Task<Result> DeleteRankingAsync(GetRankingByIdRequest rq);
        Task<Result<Ranking>> GetRankingAsync(GetRankingByIdRequest rq);
        Task<Result<List<Ranking>>> GetUserRankingsAsync(string userId);
        Task<Result<ShareableLinkResponse>> GetShareableLinkAsync(string rankingId);
        Task<Result<SharedRankResponse>> GetSharedRankAsync(string rankingId);
        //Task<Result<List<Ranking>>> GetPublicRankingsAsync(GetRankingsRequest rq);
        Task<Result> DeleteRankItem(DeleteRankItemRequest rq);
        Task<Result> UpdateRankItemPlacement(UpdateRankItemPlacementRequest rq);
    }

}

