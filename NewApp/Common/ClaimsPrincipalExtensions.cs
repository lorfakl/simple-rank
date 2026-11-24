using System.Security.Claims;

namespace simple_rank_backend.NewApp.Common;

public static class ClaimsPrincipalExtensions
{
    public static string? GetUserId(this ClaimsPrincipal principal)
    {
        return principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? principal.FindFirstValue("nameid")
            ?? principal.FindFirstValue("sub");
    }
}
