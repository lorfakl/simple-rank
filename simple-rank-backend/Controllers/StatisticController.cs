using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using simple_rank_backend.Application.Common.Extensions;
using simple_rank_backend.Application.Services.Interfaces;

namespace simple_rank_backend.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class StatisticController : ControllerBase
    {
        private readonly IStatisticService _statisticService;
        
        public StatisticController(IStatisticService statService)
        {
            _statisticService = statService;
        }


        [HttpOptions]
        public IActionResult Options()
        {
            return Ok();
        }


        [Authorize]
        [HttpGet("{rankingId}")]
        public async Task<IActionResult> Get(string rankingId)
        {
            var response = await _statisticService.GetRankStatistics(rankingId);
            return this.HandleResult(response);
        }

    }
}
