using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using simple_rank_backend.Application.Common;
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

        [HttpGet("{id}")]
        public string Get(string id)
        {
            return "value";
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
                    return HandleResult(result);
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
                return HandleResult(result);
            }   
        }

        [HttpGet("{rankingId}")]
        public async Task<IActionResult> GetRanking(string rankingId)
        {
            Result<Ranking> result = await _rankService.GetRankingAsync(new GetRankingByIdRequest { Id = rankingId });
            return HandleResult(result);
        }

        private ActionResult HandleResult<T>(Result<T> result)
        {
            if (result.IsSuccess)
            {
                // For GET returning a single item or POST returning the created item
                if (EqualityComparer<T>.Default.Equals(result.Value, default(T)) && typeof(T) != typeof(IEnumerable<>)) // Check for default(T) for non-collection types
                {
                    // This case might be for a successful operation that conceptually returns a value but the value is null (e.g. optional find)
                    // Depending on your API philosophy, you might still return Ok(null) or treat it as NotFound.
                    // For simplicity here, if the result is success but value is default, we'll treat it as if it's an OK with that default.
                    // A more specific GetProductById might treat a successful null find differently.
                    return Ok(result.Value);
                }
                return Ok(result.Value);
            }
            return HandleError(result.Error);
        }

        private ActionResult HandleResult(Result result) // For operations without a return value (PUT, DELETE)
        {
            if (result.IsSuccess)
            {
                return Ok(new { result.Message });
                    
            }
            return HandleError(result.Error);
        }

        private ActionResult HandleError(Error error)
        {
            // You can map specific error codes to status codes
            switch (error.Code)
            {
                case "Error.NotFound":
                    return NotFound(error); // Return the error object in the body
                case "Error.NullValue":
                case "Error.Validation":
                    return BadRequest(error);
                // Add more specific error mappings as needed
                default:
                    if (error.Code.Contains("Product.Name.Required") || error.Code.Contains("Product.Price.Invalid"))
                    {
                        return BadRequest(error); // Validation-like errors
                    }
                    // For unhandled or generic errors
                    return StatusCode(StatusCodes.Status500InternalServerError, error);
            }
        }

    }
}
