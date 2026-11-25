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
public class UserController(AppDbContext db) : ControllerBase
{
    [HttpOptions]
    public IActionResult Options() => Ok();

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> SetUserMetadata([FromBody] SetMetadataDTO rq)
    {
        var callerId = User.GetUserId();
        if (string.IsNullOrWhiteSpace(callerId) || callerId != rq.Id) return Forbid();

        var metadata = await db.UserMetadata.FirstOrDefaultAsync(m => m.UserId == rq.Id);
        if (metadata is null)
        {
            metadata = new UserMetadata { UserId = rq.Id };
            db.UserMetadata.Add(metadata);
        }

        metadata.DisplayName = rq.Name;
        metadata.AvatarUrl = rq.AvatarUrl ?? string.Empty;
        metadata.LastUpdated = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new ResponseBase { Message = "Successfully updated metadata" });
    }
}
