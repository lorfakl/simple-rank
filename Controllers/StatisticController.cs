using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using simple_rank_backend.Common;
using simple_rank_backend.Data;
using simple_rank_backend.DTOs;
using simple_rank_backend.Models;
using System.Security.Claims;

namespace simple_rank_backend.Controllers;

[ApiController]
[Route("api/[controller]/[action]")]
public class StatisticController(AppDbContext db) : ControllerBase
{
    [HttpOptions]
    public IActionResult Options() => Ok();

    [HttpGet]
    public async Task<IActionResult> GetRankingsCount()
    {
        var count = await db.Rankings.CountAsync();
        return Ok(new RankingsCountResponse { TotalCount = count, Message = "Successfully retrieved total rankings count" });
    }

    [HttpGet]
    public async Task<IActionResult> GetUserCount()
    {
        var count = await db.Users.CountAsync();
        return Ok(new UsersCountResponse { TotalCount = count, Message = "Successfully retrieved total users count" });
    }

    [Authorize]
    [HttpGet("{rankingId}")]
    public async Task<IActionResult> Get(string rankingId)
    {
        return Ok(new RankStatisticResponse { Statistics = await BuildStats(rankingId) });
    }

    [HttpGet("{rankingId}")]
    public async Task<IActionResult> GetShared(string rankingId)
    {
        var link = await db.ShareableLinks.FirstOrDefaultAsync(s => s.SharedId == rankingId);
        if (link is null) return NotFound();

        return Ok(new RankStatisticResponse { Statistics = await BuildStats(link.RankingId) });
    }

    [HttpPost("{rankingId}")]
    public async Task<IActionResult> RecordView([FromBody] ReactDto rq, string rankingId)
    {
        var callerId = User.GetUserId() ?? string.Empty;
        var resolvedRankingId = rankingId;

        if (rq.IsShared)
        {
            var link = await db.ShareableLinks.FirstOrDefaultAsync(s => s.SharedId == rankingId);
            if (link is null) return NotFound();
            resolvedRankingId = link.RankingId;
        }

        db.StatisticEvents.Add(new StatisticEvent
        {
            RankingId = resolvedRankingId,
            UserId = callerId,
            Name = Statistics.VIEW.ToString(),
            Value = 1
        });

        await db.SaveChangesAsync();
        return Ok(new ResponseBase { Message = "Successfully recorded view" });
    }

    [Authorize]
    [HttpPost("{rankingId}")]
    public async Task<IActionResult> React([FromBody] ReactDto rq, string rankingId)
    {
        var callerId = User.GetUserId() ?? string.Empty;
        var callerIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? string.Empty;

        var alreadyReacted = await db.ReactionHistories.AnyAsync(h => h.IpAddress == callerIp && (h.RankingId == rankingId || h.SharedId == rankingId));
        if (alreadyReacted) return Ok(new ResponseBase { Message = "Reaction already recorded" });

        var resolvedRankingId = rankingId;
        if (rq.IsShared)
        {
            var link = await db.ShareableLinks.FirstOrDefaultAsync(s => s.SharedId == rankingId);
            if (link is null) return NotFound();
            resolvedRankingId = link.RankingId;
        }

        var normalized = rq.ReactionId.Trim().ToUpperInvariant();
        if (!Enum.TryParse<Statistics>(normalized, out var reaction)) return BadRequest();

        db.StatisticEvents.Add(new StatisticEvent
        {
            RankingId = resolvedRankingId,
            UserId = callerId,
            Name = reaction.ToString(),
            Value = 1
        });

        db.ReactionHistories.Add(new ReactionHistory
        {
            RankingId = rq.IsShared ? string.Empty : resolvedRankingId,
            SharedId = rq.IsShared ? rankingId : null,
            IpAddress = callerIp,
            UserId = string.IsNullOrWhiteSpace(callerId) ? Guid.NewGuid().ToString() : callerId,
            IsRealUser = !string.IsNullOrWhiteSpace(callerId)
        });

        await db.SaveChangesAsync();
        return Ok(new ResponseBase { Message = "Successfully recorded view" });
    }

    private async Task<Dictionary<Statistics, int>> BuildStats(string rankingId)
    {
        var statEvents = await db.StatisticEvents.Where(s => s.RankingId == rankingId).ToListAsync();
        var output = Enum.GetValues<Statistics>().ToDictionary(k => k, _ => 0);

        foreach (var s in statEvents)
        {
            if (Enum.TryParse<Statistics>(s.Name, true, out var key))
                output[key] += 1;
        }

        return output;
    }
}
