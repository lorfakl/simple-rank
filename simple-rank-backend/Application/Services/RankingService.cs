using simple_rank_backend.Application.Common;
using simple_rank_backend.Application.Services.Interfaces;
using simple_rank_backend.DTOs.Ranking;
using simple_rank_backend.DTOs.Ranking.Responses;
using simple_rank_backend.Models;
using Supabase;
using Supabase.Postgrest.Responses;
using System.Linq;
using System.Security.Claims;

namespace simple_rank_backend.Application.Services
{
    public class RankingService : IRankService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly Client _supabase;

        public RankingService(IHttpContextAccessor httpContextAccessor, Client supabaseService)
        {
            _httpContextAccessor = httpContextAccessor;
            _supabase = supabaseService;
        }

        public async Task<Result> CreateRankingAsync(CreateRankingRequest rq, string ownerId)
        {
            string userId = ownerId;
            TableModels.Ranking newRanking = new TableModels.Ranking(rq, userId);
            var result = await _supabase.From<TableModels.Ranking>().Insert(newRanking);

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

        public async Task<Result<Ranking>> GetRankingAsync(GetRankingByIdRequest rq)
        {
            var queryResult = await _supabase.From<TableModels.Ranking>()
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

        public async Task<Result<ShareableLinkResponse>> GetShareableLinkAsync(string rankingId)
        {
            //get the ownerId if not throw error
            //check to see if a shareable link has been created
            //
            string ownerId = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            if (String.IsNullOrEmpty(ownerId))
            {
                return Result<ShareableLinkResponse>.Failure(Error.NullValue, "Unable to determine owner Id");
            }

            var rankingQueryResult = await _supabase.From<TableModels.Ranking>()
                .Where(r => r.RankingId == rankingId)
                .Where(r => r.Owner == ownerId).Get();

            //handle supabase error
            if(!rankingQueryResult.ResponseMessage.IsSuccessStatusCode)
            {
                var supaBaseError = await Error.SupabaseError(rankingQueryResult.ResponseMessage, "Unable to get shareable link");
                return Result<ShareableLinkResponse>.Failure(supaBaseError);
            }

            if(rankingQueryResult.Models.Count > 0)
            {
                var ranking = rankingQueryResult.Model;
                if(ranking.IsShared)
                {
                    string shareableId = ranking.ShareableId.SharedLinkId;
                    if(string.IsNullOrEmpty(shareableId))
                    {
                        shareableId = HashService.GenerateRobustHash(shareableId);
                    }
                    
                    var shareableResponse = new ShareableLinkResponse(shareableId);
                    return Result<ShareableLinkResponse>.Success(shareableResponse, "successfully retrieved shareable id");
                }
                else
                {
                    string shareable = HashService.GenerateRobustHash(rankingId);
                    var createShareableQuery = await _supabase.From<TableModels.ShareableLink>()
                        .Insert(new TableModels.ShareableLink
                        {
                            RankingId = rankingId,
                            SharedLinkId = shareable
                        });

                    if(!createShareableQuery.ResponseMessage.IsSuccessStatusCode)
                    {
                        var supaBaseError = await Error.SupabaseError(createShareableQuery.ResponseMessage, "Unable to get shareable link");
                        return Result<ShareableLinkResponse>.Failure(supaBaseError);
                    }

                    var updateRankingQueryResult = await _supabase.From<TableModels.Ranking>()
                        .Where(r => r.RankingId == rankingId)
                        .Where(r => r.Owner == ownerId)
                        .Set(r => r.IsShared, true)
                        .Update();

                    if(updateRankingQueryResult.ResponseMessage.IsSuccessStatusCode)
                    {
                        var shareableResponse = new ShareableLinkResponse(shareable);
                        return Result<ShareableLinkResponse>.Failure(Error.NotFound);
                    }
                    else
                    {
                        var errorResult = await Error.SupabaseError(updateRankingQueryResult.ResponseMessage, "Failed to updating ranking as shared");
                        return Result<ShareableLinkResponse>.Failure(errorResult);
                    }
                }
            }
            else
            {
                //weird this happened tbh
                return Result<ShareableLinkResponse>.Failure(Error.NotFound);
            }


            //throw new NotImplementedException();

        }

        public async Task<Result<List<Ranking>>> GetUserRankingsAsync(string userId)
        {
            var queryResult = await _supabase.From<TableModels.Ranking>()
                .Where(r => r.Owner == userId)
                .Get();
            
            var rankings = queryResult.Models.Select(r => new Ranking(r)).ToList();
            return Result<List<Ranking>>.Success(rankings, $"Successfully pulled {rankings.Count} rankings for user");
        }

        public async Task<Result> UpdateBasicRankingInfoAsync(UpdateRankingRequest rq)
        {
            string ownerId = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            if (String.IsNullOrEmpty(ownerId))
            {
                return Result.Failure(Error.NullValue, "Unable to determine owner Id");
            }

            var updateResult = await _supabase.From<TableModels.Ranking>()
                .Where(r => r.RankingId == rq.Id)
                .Where(r => r.Owner == ownerId)
                .Set(r => r.Description, rq.Description)
                .Set(r => r.Name, rq.Title)
                .Set(r => r.IsPublic, rq.IsPublic)
                .Update();

            string msg = updateResult.ResponseMessage.IsSuccessStatusCode ? $"successfully updated {updateResult.Models.Count} rankings" : "failed to update basic ranking information";
            return Result.HandleSupabase(updateResult.ResponseMessage, msg);
        }

        public async Task<Result> UpdateRankingAsync(UpdateRankingRequest rq)
        {
            string ownerId = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            if(String.IsNullOrEmpty(ownerId))
            {
                return Result.Failure(Error.NullValue, "Unable to determine owner Id");
            }

            var getOwningRankResult = await _supabase.From<TableModels.Ranking>()
                .Where(r => r.RankingId == rq.Id)
                .Where(r => r.Owner == ownerId)
                .Get();

            if(!getOwningRankResult.ResponseMessage.IsSuccessStatusCode)
            {
                return Result.HandleSupabase(getOwningRankResult.ResponseMessage, "error occurred when executing supabase call");
            }

            if (getOwningRankResult.Models.Count != 1)
            {
                return Result.Failure(Error.ValidationFailed);
            }

            List<TableModels.RankingItems> itemsToUpsert = rq.Items.Select(i => new TableModels.RankingItems(i.Id, rq.Id, i.Name, i.Description, i.Rank)).ToList();
            var updateResult = await _supabase.From<TableModels.RankingItems>()
                .Upsert(itemsToUpsert);

            if(!updateResult.ResponseMessage.IsSuccessStatusCode)
            {
                return Result.HandleSupabase(updateResult.ResponseMessage, "failed to update rank items");
            }

            var updateItemCountResult = await _supabase.From<TableModels.Ranking>()
                .Where(r => r.RankingId == rq.Id)
                .Where(r => r.Owner == ownerId)
                .Set(r => r.ItemCount, (uint)rq.Items.Count)
                .Update();

            if(!updateItemCountResult.ResponseMessage.IsSuccessStatusCode)
            {
                return Result.HandleSupabase(updateItemCountResult.ResponseMessage, "failed to update ranking ids");
            }

            return Result.Success("successfully updated rank items");
        }

        public async Task<Result> UpdateRankItemPlacement(UpdateRankItemPlacementRequest rq)
        {
            string ownerId = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            if (String.IsNullOrEmpty(ownerId))
            {
                return Result.Failure(Error.NullValue, "Unable to determine owner Id");
            }
            rq.ItemIdToRank = rq.ItemIdToRank.OrderBy(p => p.Value).ToDictionary();
            var updateItemPlacement = await _supabase.From<TableModels.Ranking>()
                .Where(r => r.RankingId == rq.RankingId)
                .Where(r => r.Owner == ownerId)
                .Set(r => r.ItemPlacement, rq.ItemIdToRank)
                .Update();

            if (updateItemPlacement.ResponseMessage.IsSuccessStatusCode)
            {
                return Result.Success("successfully updated rank item placements");
            }
            else
            {
                return Result.HandleSupabase(updateItemPlacement.ResponseMessage, "unable to update item placement, invalid");
            }

            //if(checkRankOwnerResult.Models.Count != 1)
            //{
            //    return Result.Failure(Error.ValidationFailed);
            //}


            //List<Task<ModeledResponse<TableModels.RankingItems>>> updates = new List<Task<ModeledResponse<TableModels.RankingItems>>>();
            //foreach(var pair in rq.ItemIdToRank)
            //{
            //   var updateTask = _supabase.From<TableModels.RankingItems>()
            //    .Where(r => r.ItemId == pair.Key)
            //    .Set(r => r.Rank, (uint)pair.Value)
            //    .Update();

            //    updates.Add(updateTask);

            //}

            //ModeledResponse<TableModels.RankingItems>[] completedUpdates = await Task.WhenAll(updates);

            //foreach(var result in completedUpdates)
            //{
            //    if(!result.ResponseMessage.IsSuccessStatusCode)
            //    {
            //        string errorDetails = await result.ResponseMessage.Content.ReadAsStringAsync();
            //        throw new Exception(errorDetails);
            //    }
            //}

            //return Result.Success("successfully updated rank item placements");

            //Dictionary<string, short> rank_updates = new Dictionary<string, short>();
            //foreach(var pair in rq.ItemIdToRank)
            //{
            //    rank_updates.Add(pair.Key, (short)pair.Value);
            //}
            ////public.update_ranking_items_batch()
            //var updateResult = await _supabase.Rpc("update_ranking_items_batch", new Dictionary<string, object>
            //{
            //    { "rank_updates", rank_updates }
            //});

            //if (updateResult.ResponseMessage.IsSuccessStatusCode)
            //{
            //    return Result.Success("successfully updated rank item placements");
            //}
            //else
            //{
            //    return Result.HandleSupabase(updateResult.ResponseMessage, "unable to update item placement, invalid");
            //}


            //List<TableModels.RankingItems> itemsToUpdate = rq.ItemIdToRank
            //    .Select(pair => new TableModels.RankingItems(pair.Key, rq.RankingId, string.Empty, string.Empty, (uint)pair.Value))
            //    .ToList();

            //var upsertOptions = new Supabase.Postgrest.QueryOptions();
            //upsertOptions.OnConflict = "id";
            //var updateResult = await _supabase.From<TableModels.RankingItems>()
            //    .Upsert(itemsToUpdate, upsertOptions);

            //if (!updateResult.ResponseMessage.IsSuccessStatusCode)
            //{
            //    return Result.HandleSupabase(updateResult.ResponseMessage);
            //}

            //try
            //{
            //    List<string> keys = [.. rq.ItemIdToRank.Keys];
            //    await _supabase.From<TableModels.RankingItems>()
            //    .Where(item => item.RankingId == rq.RankingId)
            //    .Filter(item => item.ItemId, 
            //        Supabase.Postgrest.Constants.Operator.In, 
            //        keys)
            //    .Where(item => item.Name == string.Empty)
            //    .Where(item => item.Description == string.Empty)
            //    .Delete();
            //}
            //catch(Exception ex)
            //{
            //    return Result.Failure(Error.Custom("500", ex.Message));
            //}
        }

        public Task<Result> DeleteRankingAsync(GetRankingByIdRequest rq)
        {
            throw new NotImplementedException();
        }

        public async Task<Result> DeleteRankItem(DeleteRankItemRequest rq)
        {
            string ownerId = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            if (String.IsNullOrEmpty(ownerId))
            {
                return Result.Failure(Error.NullValue, "Unable to determine owner Id");
            }

            var checkRankOwnerResult = await _supabase.From<TableModels.Ranking>()
                .Where(r => r.RankingId == rq.RankingId)
                .Where(r => r.Owner == ownerId)
                .Get();

            if(!checkRankOwnerResult.ResponseMessage.IsSuccessStatusCode)
            {
                return Result.HandleSupabase(checkRankOwnerResult.ResponseMessage, "unable to delete item, invalid");
            }

            if(checkRankOwnerResult.Models.Count != 1)
            {
                return Result.Failure(Error.ValidationFailed);
            }

             await _supabase.From<TableModels.RankingItems>()
                .Where(item => item.RankingId == rq.RankingId)
                .Where(item => item.ItemId == rq.RankItemId)
                .Delete();

            return Result.Success("removed rank item");

        }
    }
}
