using Microsoft.Extensions.Caching.Memory;

namespace simple_rank_backend.Application.Middleware
{
    public class AuthTokenValidator
    {
        private readonly RequestDelegate _next;
        private readonly IMemoryCache _cache;
        public AuthTokenValidator(RequestDelegate next, IMemoryCache memoryCache)
        {
            _next = next;
            _cache = memoryCache;
        }

        public async Task Invoke(HttpContext context)
        {

            await _next(context);

        }
    }
}
