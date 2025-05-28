using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using simple_rank_backend.Application.Services;

namespace simple_rank_backend.Controllers
{
    [Route("api/[controller]")]
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

        [HttpGet("{id}")]
        public string Get([FromQuery] string id)
        {
            return "value";
        }

        [HttpPost]
        public void Post([FromBody] string value)
        {

        }
    }
}
