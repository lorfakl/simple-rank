using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using simple_rank_backend.NewApp.Data;
using simple_rank_backend.NewApp.DTOs;
using simple_rank_backend.NewApp.Models;
using simple_rank_backend.NewApp.Services;
using System.Security.Claims;

namespace simple_rank_backend.NewApp.Controllers;

[ApiController]
[Route("api/[controller]/[action]")]
public class AuthController(AppDbContext db, TokenService tokenService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> SignUp([FromBody] SignUpRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest("Email and password are required");

        if (await db.Users.AnyAsync(u => u.Email == email))
            return Conflict("Email already exists");

        var user = new AppUser
        {
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        db.Users.Add(user);
        db.UserMetadata.Add(new UserMetadata
        {
            UserId = user.Id,
            DisplayName = email.Split('@')[0],
            AvatarUrl = string.Empty
        });
        await db.SaveChangesAsync();

        return Ok(BuildAuthResponse(user, tokenService.CreateToken(user), user.Metadata));
    }

    [HttpPost]
    public async Task<IActionResult> SignIn([FromBody] SignInRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.Include(u => u.Metadata).FirstOrDefaultAsync(u => u.Email == email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized("Invalid credentials");

        return Ok(BuildAuthResponse(user, tokenService.CreateToken(user), user.Metadata));
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var user = await db.Users.Include(u => u.Metadata).FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null) return Unauthorized();

        return Ok(new { user = BuildAuthUser(user, user.Metadata) });
    }

    [Authorize]
    [HttpPost]
    public new IActionResult SignOut() => Ok(new { message = "Signed out" });

    private static AuthResponse BuildAuthResponse(AppUser user, string accessToken, UserMetadata? metadata)
    {
        return new AuthResponse
        {
            Session = new AuthSession
            {
                AccessToken = accessToken,
                User = BuildAuthUser(user, metadata)
            }
        };
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
