using Microsoft.Extensions.Caching.Memory;
using simple_rank_backend.Application.Common;
using simple_rank_backend.Application.Services.Interfaces;
using simple_rank_backend.DTOs;
using simple_rank_backend.DTOs.User;
using simple_rank_backend.Models;
using Supabase;


namespace simple_rank_backend.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IUserCacheService _userCache;
        private readonly Client _supabase;

        public UserService(IHttpContextAccessor httpContextAccessor, Client supabaseService, IUserCacheService cache)
        {
            _httpContextAccessor = httpContextAccessor;
            _supabase = supabaseService;
            _userCache = cache;
        }

        public async Task<Result<ResponseBase>> SetUserMetadata(SetMetadataDTO rq)
        {
            Supabase.Postgrest.QueryOptions insertOptions = new Supabase.Postgrest.QueryOptions();
            insertOptions.DuplicateResolution = Supabase.Postgrest.QueryOptions.DuplicateResolutionType.IgnoreDuplicates;
            
            TableModels.UserMetadata metadata = new TableModels.UserMetadata(rq);

            var insertResult = await _supabase.From<TableModels.UserMetadata>().Insert(model: metadata);
            if(insertResult.ResponseMessage.IsSuccessStatusCode)
            {
                await _userCache.SetUserAsync(rq.Id, new UserMetadata(metadata));
                ResponseBase response = new ResponseBase("Successfully updated user mmetadata");
                return Result<ResponseBase>.Success(response);
            }
            else
            {
                var error = await Error.SupabaseError(insertResult.ResponseMessage, "Supabase error");
                return Result<ResponseBase>.Failure(error);
            }
        }

        public async Task<UserMetadata> GetUserMetadataAsync(string userId)
        {
            var result = await _supabase.From<TableModels.UserMetadata>().Where(u => u.UserId == userId).Get();
            if(result.ResponseMessage.IsSuccessStatusCode && result.Models.Any())
            {
                var response = new UserMetadata(result.Models.First());
                return response;
            }
            else
            {
                return default(UserMetadata);
            }
        }

        
    }
}
