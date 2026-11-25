using System.Security.Claims;

namespace simple_rank_backend.Common;

public static class ClaimsPrincipalExtensions
{
    public static string? GetUserId(this ClaimsPrincipal principal)
    {
        return principal.FindFirstValue("userId")
            ?? principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? principal.FindFirstValue("nameid")
            ?? principal.FindFirstValue("sub");
    }
}
