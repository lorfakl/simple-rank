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
public class AuthController(AppDbContext db) : ControllerBase
{
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Sync()
    {
        var userId = User.GetUserId();
        var clerkId = User.FindFirstValue("sub");
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(clerkId)) return Unauthorized();

        var user = await db.Users.Include(u => u.Metadata).FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
        {
            if (userId != clerkId) return Forbid();
            var email = User.FindFirstValue("primaryEmail")?.Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(email)) return BadRequest("A Clerk primary email is required");
            if (await db.Users.AnyAsync(u => u.Email == email)) return Conflict("Account requires migration");

            user = new AppUser { Id = userId, Email = email };
            user.Metadata = new UserMetadata { UserId = userId, DisplayName = email.Split('@')[0], AvatarUrl = string.Empty };
            db.Users.Add(user);
            await db.SaveChangesAsync();
        }

        return Ok(new { user = BuildAuthUser(user, user.Metadata) });
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> Me()
    {
        var userId = User.GetUserId();
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var user = await db.Users.Include(u => u.Metadata).FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null) return Unauthorized();

        return Ok(new { user = BuildAuthUser(user, user.Metadata) });
    }

    private static AuthUser BuildAuthUser(AppUser user, UserMetadata? metadata)
    {
        return new AuthUser
        {
            Id = user.Id,
            Email = user.Email,
            UserMetadata = new AuthUserMetadata
            {
                FullName = metadata?.DisplayName ?? user.Email,
                AvatarUrl = metadata?.AvatarUrl ?? string.Empty
            }
        };
    }
}
