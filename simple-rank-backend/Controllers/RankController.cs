using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using simple_rank_backend.Application.Common;
using simple_rank_backend.Application.Common.Extensions;
using simple_rank_backend.Application.Services.Interfaces;
using simple_rank_backend.DTOs.Ranking;
using simple_rank_backend.Models;
using System.Security.Claims;


namespace simple_rank_backend.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class RankController : ControllerBase
    {
        private readonly IMemoryCache _cache;
        private readonly IRankService _rankService;
        public RankController(IRankService rankingService, IMemoryCache memoryCache)
        {
            _cache = memoryCache;
            _rankService = rankingService;
        }
        

        [HttpOptions]
        public IActionResult Options()
        {
            return Ok();
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateRanking([FromBody] CreateRankingRequest rq)
        {
            // Logic to create a ranking
            // This would typically involve saving the ranking to a database
            // and possibly returning the created ranking object or its ID.

            if(ModelState.IsValid)
            {
                string ownerId = User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
                if (string.IsNullOrEmpty(ownerId))
                {
                    return Unauthorized("User is not authenticated");
                }
                else
                {
                    var result = await _rankService.CreateRankingAsync(rq, ownerId);
                    return this.HandleResult(result);
                }
                    
                //var name = User?.Identity?.Name;
                //return Ok(new
                //{
                //    Message = $"{name} created ranking {rq.Title} successfully",
                //    Request = rq
                //});
            }
            else
            {
                return BadRequest();
            }
            
        }

        [HttpGet("{userId}")]
        [Authorize]
        public async Task<IActionResult> GetUserRankings(string userId)
        {
            string ownerId = User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            if (string.IsNullOrEmpty(ownerId))
            {
                return Unauthorized("User is not authenticated");
            }

            if(ownerId != userId)
            {
                return Forbid();
            }
            else
            {
                Result<List<Ranking>> result = await _rankService.GetUserRankingsAsync(ownerId);
                return this.HandleResult(result);
            }   
        }

        [HttpGet("{rankingId}")]
        public async Task<IActionResult> GetRanking(string rankingId)
        {
            Result<Ranking> result = await _rankService.GetRankingAsync(new GetRankingByIdRequest { Id = rankingId });
            return this.HandleResult(result);
        }


        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateRankItem([FromBody] UpdateRankItemRequest rq)
        {
            if (ModelState.IsValid)
            {
                //check that the caller owns the ranking that owns the rank item attempting to be created
                Result result = await _rankService.UpdateRankItem(rq);
                return this.HandleResult(result);
            }
            else
            {
                return this.HandleError(Error.InvalidModelState);
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> EditRankItem([FromBody] UpdateRankItemRequest rq)
        {
            if(ModelState.IsValid)
            {
                //check that the caller owns the ranking that owns the rank item attempting to be edited
                Result result = await _rankService.UpdateRankItem(rq);
                return this.HandleResult(result);
            }
            else
            {
                return this.HandleError(Error.InvalidModelState);
            }
                
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> DeleteRankItem([FromBody] DeleteRankItemRequest rq)
        {
            //check that the caller owns the ranking that owns the rank item attempting to be deleted
            Result result = await _rankService.DeleteRankItem(rq);
            return this.HandleResult(result);
        }

        

    }
}
