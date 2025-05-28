using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using simple_rank_backend.Application.Services;

namespace simple_rank_backend.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class RankController : ControllerBase
    {
        private readonly SupabaseService _supabaseService;
        private readonly IMemoryCache _cache;

        public RankController(SupabaseService supabaseService, IMemoryCache memoryCache)
        {
            _supabaseService = supabaseService;
            _cache = memoryCache;
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
        public IActionResult CreateRanking([FromBody] CreateRankingRequest request)
        {
            // Logic to create a ranking
            // This would typically involve saving the ranking to a database
            // and possibly returning the created ranking object or its ID.
            if(ModelState.IsValid)
            {
                var name = HttpContext?.User?.Identity?.Name;

                return Ok(new
                {
                    Message = "Ranking created successfully",
                    Request = request
                });
            }
            else
            {
                return BadRequest();
            }
            
        }
        
    }
}
