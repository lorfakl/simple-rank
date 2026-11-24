using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using simple_rank_backend.NewApp.Data;
using simple_rank_backend.NewApp.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var provider = builder.Configuration["DatabaseProvider"] ?? "Sqlite";
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Data Source=simpleRank.db";

if (provider.Equals("Postgres", StringComparison.OrdinalIgnoreCase))
{
    builder.Services.AddDbContext<AppDbContext>(o => o.UseNpgsql(connectionString));
}
else
{
    builder.Services.AddDbContext<AppDbContext>(o => o.UseSqlite(connectionString));
}

var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "simple-rank-api";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "simple-rank-client";
var jwtKey = builder.Configuration["Jwt:Key"] ?? "dev-only-change-this-key-to-32-plus-chars";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<TokenService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontEnd", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://simplerank.app",
                "https://simplerank.io")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontEnd");
app.UseAuthentication();
app.UseAuthorization();

// Production SPA serving (single-project migration): static assets +
// index.html fallback from wwwroot (vite build.outDir). Guarded on
// wwwroot/index.html existing so a bare `dotnet run` without a frontend
// build doesn't crash on a missing wwwroot directory.
var wwwrootPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
var hasFrontendBuild = File.Exists(Path.Combine(wwwrootPath, "index.html"));

if (hasFrontendBuild)
{
    app.UseDefaultFiles();
    app.UseStaticFiles();
}

// Controllers register before the fallback. Unmatched /api/* requests get
// 404 JSON: the literal "api" segment outranks the catch-all fallback route,
// so client routes (/Home, /Login, /ranking/:id, ...) still serve index.html.
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

RequestDelegate apiNotFoundHandler = async context =>
{
    context.Response.StatusCode = StatusCodes.Status404NotFound;
    context.Response.ContentType = "application/json";
    await context.Response.WriteAsync("{\"error\":\"Not Found\"}");
};
app.Map("/api/{**path}", apiNotFoundHandler);

if (hasFrontendBuild)
{
    app.MapFallbackToFile("index.html");
}

app.Run();

public partial class Program { }
