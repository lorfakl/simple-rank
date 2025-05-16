using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using simple_rank_backend.Application.Middleware;
using simple_rank_backend.Application.Services;
using Supabase;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using Newtonsoft.Json;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
builder.Configuration.AddEnvironmentVariables();

var supabaseUrl = Environment.GetEnvironmentVariable("supabaseUrl", EnvironmentVariableTarget.Machine);
var supabaseKey = Environment.GetEnvironmentVariable("supabaseKey", EnvironmentVariableTarget.Machine);

if(string.IsNullOrEmpty(supabaseUrl) || string.IsNullOrEmpty(supabaseKey))
{
    throw new ArgumentNullException("Supabase URL or Key is not set in environment variables.");
}

//builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//.AddJwtBearer(options =>
//{
//    var jwtSettings = builder.Configuration.GetSection("JwtSettings");
//    options.TokenValidationParameters = new TokenValidationParameters
//    {
//        ValidateIssuerSigningKey = true,
//        IssuerSigningKey = new SymmetricSecurityKey(
//            Encoding.UTF8.GetBytes(jwtSettings["SecretKey"])),
//        ValidateIssuer = true,
//        ValidIssuer = jwtSettings["Issuer"],
//        ValidateAudience = true,
//        ValidAudience = jwtSettings["Audience"],
//        ValidateLifetime = true,
//        ClockSkew = TimeSpan.Zero
//    };
//});

//builder.Services.AddAuthorization(options =>
//{
//    options.AddPolicy("AdminPolicy", policy =>
//        policy.RequireClaim(ClaimTypes.Role, "Admin"));
//    options.AddPolicy("UserPolicy", policy =>
//        policy.RequireClaim(ClaimTypes.Role, "User", "Admin"));
//});

builder.Services.AddMemoryCache();
builder.Services.AddSingleton<SupabaseService>(sp =>
{
    var options = new SupabaseOptions
    {
        AutoRefreshToken = true,
        AutoConnectRealtime = true
    };

    return new SupabaseService(supabaseUrl, supabaseKey, options);
});

builder.Services.AddRateLimiter(options =>
{
    // Fixed window rate limiter - 100 requests per minute
    options.AddFixedWindowLimiter("fixed", limiterOptions =>
    {
        limiterOptions.PermitLimit = 100;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 20;
    });

    // Sliding window rate limiter - 50 requests per 30 seconds
    options.AddSlidingWindowLimiter("sliding", limiterOptions =>
    {
        limiterOptions.PermitLimit = 50;
        limiterOptions.Window = TimeSpan.FromSeconds(30);
        limiterOptions.SegmentsPerWindow = 6;
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 10;
    });

    // Per-user rate limiter - 20 requests per minute per user
    options.AddTokenBucketLimiter("per-user", limiterOptions =>
    {
        limiterOptions.TokenLimit = 20;
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 5;
        limiterOptions.ReplenishmentPeriod = TimeSpan.FromMinutes(1);
        limiterOptions.TokensPerPeriod = 20;
        limiterOptions.AutoReplenishment = true;
    });

    // Global rate limiter by IP
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 200,
                Window = TimeSpan.FromMinutes(1)
            }));

    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        await context.HttpContext.Response.WriteAsync("Rate limit exceeded. Please try again later.", token);
    };
});

builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseMiddleware<AuthTokenValidator>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors();
app.UseRateLimiter();

//app.UseAuthentication();
//app.UseAuthorization();

app.MapControllers();

app.Run();
