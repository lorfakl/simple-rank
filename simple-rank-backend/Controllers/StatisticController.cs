using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using simple_rank_backend.Application.Common.Extensions;
using simple_rank_backend.Application.Services.Interfaces;
using simple_rank_backend.DTOs;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.Diagnostics.Metrics;
using Microsoft.AspNetCore.Server.HttpSys;

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

        
        [HttpGet("{rankingId}")]
        public async Task<IActionResult> GetShared(string rankingId)
        {
            var response = await _statisticService.GetSharedRankStatistics(rankingId);
            return this.HandleResult(response);
        }

        [HttpPost("{rankingId}")]
        public async Task<IActionResult> React([FromBody] ReactDto rq, string rankingId)
        {
            if (ModelState.IsValid)
            {
                if (string.IsNullOrEmpty(rq.ReactionId))
                {
                    return BadRequest();
                }

                if(Enum.TryParse<Statistics>(rq.ReactionId.ToUpper(), out _))
                {
                    var response = await _statisticService.RecordReaction(rq, rankingId);
                    return this.HandleResult(response);
                }
                else
                {
                    return BadRequest();
                }
            }
            else
            {
                return BadRequest();
            }
            
        }
    }
}
