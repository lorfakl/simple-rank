using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.IdentityModel.Tokens;
using simple_rank_backend.Common;
using simple_rank_backend.Data;
using simple_rank_backend.Models;

namespace SimpleRank.Tests;

public class UnitTest1
{
    [Fact]
    public void GetUserId_PrefersImportedExternalId()
    {
        var principal = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "user_clerk"),
            new Claim("userId", "existing-user-id")
        }));

        Assert.Equal("existing-user-id", principal.GetUserId());
    }

    [Fact]
    public async Task AuthFlow_ClerkSessionSyncAndMe()
    {
        await using var app = new SimpleRankWebApplicationFactory();
        using var client = app.CreateClient();
        var email = UniqueEmail();
        var userId = $"user_{Guid.NewGuid():N}";

        var meWithoutToken = await client.GetAsync("/api/Auth/Me");
        Assert.Equal(HttpStatusCode.Unauthorized, meWithoutToken.StatusCode);

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", SimpleRankWebApplicationFactory.CreateToken(userId, email));
        var sync = await client.PostAsync("/api/Auth/Sync", null);
        Assert.True(sync.IsSuccessStatusCode, $"{sync.StatusCode}: {string.Join(", ", sync.Headers.WwwAuthenticate)}");

        var meResponse = await client.GetAsync("/api/Auth/Me");
        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);

        using var meJson = await JsonDocument.ParseAsync(await meResponse.Content.ReadAsStreamAsync());
        Assert.Equal(userId, meJson.RootElement.GetProperty("user").GetProperty("id").GetString());
        Assert.Equal(email, meJson.RootElement.GetProperty("user").GetProperty("email").GetString());
        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsJsonAsync("/api/Auth/SignIn", new { email, password = "x" })).StatusCode);
    }

    [Fact]
    public async Task ClerkSession_RejectsInvalidClaimsAndIssuer()
    {
        await using var app = new SimpleRankWebApplicationFactory();
        using var client = app.CreateClient();
        var userId = $"user_{Guid.NewGuid():N}";
        var email = UniqueEmail();
        using var untrustedKey = RSA.Create(2048);
        foreach (var token in new[]
        {
            SimpleRankWebApplicationFactory.CreateToken(userId, email, signingKey: untrustedKey),
            SimpleRankWebApplicationFactory.CreateToken(userId, email, issuer: "https://wrong.example"),
            SimpleRankWebApplicationFactory.CreateToken(userId, email, expires: DateTime.UtcNow.AddMinutes(-10)),
            SimpleRankWebApplicationFactory.CreateToken(userId, email, party: "https://wrong.example"),
            SimpleRankWebApplicationFactory.CreateToken(userId, email, mappedId: ""),
            SimpleRankWebApplicationFactory.CreateToken(userId, email, status: "pending")
        })
        {
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsync("/api/Auth/Sync", null)).StatusCode);
        }
    }

    [Fact]
    public async Task ClerkSession_ImportedIdPreservesOwnershipAndRejectsMissingMapping()
    {
        await using var app = new SimpleRankWebApplicationFactory();
        using var client = app.CreateClient();
        var oldId = Guid.NewGuid().ToString();
        var email = UniqueEmail();
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Users.Add(new AppUser { Id = oldId, Email = email });
            db.Rankings.Add(new Ranking { OwnerId = oldId, Title = "Imported", Description = "" });
            await db.SaveChangesAsync();
        }

        var clerkId = $"user_{Guid.NewGuid():N}";
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", SimpleRankWebApplicationFactory.CreateToken(clerkId, email, mappedId: oldId));
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsync("/api/Auth/Sync", null)).StatusCode);
        var rankings = await client.GetAsync($"/api/Rank/GetUserRankings/{oldId}");
        Assert.Equal(HttpStatusCode.OK, rankings.StatusCode);
        Assert.Contains("Imported", await rankings.Content.ReadAsStringAsync());

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", SimpleRankWebApplicationFactory.CreateToken(clerkId, email, mappedId: Guid.NewGuid().ToString()));
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsync("/api/Auth/Sync", null)).StatusCode);

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", SimpleRankWebApplicationFactory.CreateToken(clerkId, email));
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsync("/api/Auth/Sync", null)).StatusCode);
    }

    [Fact]
    public async Task RankingCrudAndRankItemsAndPublicEndpoints_Work()
    {
        await using var app = new SimpleRankWebApplicationFactory();
        using var client = app.CreateClient();

        var auth = await SignUpAndAuthenticate(client);

        var createResponse = await client.PostAsJsonAsync("/api/Rank/CreateRanking", new
        {
            title = "Top Languages",
            description = "initial description",
            isPublic = false,
            items = new[]
            {
                new { id = "item-1", name = "C#", description = "backend", rank = 1u },
                new { id = "item-2", name = "TypeScript", description = "frontend", rank = 2u }
            }
        });
        Assert.Equal(HttpStatusCode.OK, createResponse.StatusCode);

        var rankingId = await ReadStringPath(createResponse, "id");

        var getUserRankings = await client.GetAsync($"/api/Rank/GetUserRankings/{auth.UserId}");
        Assert.Equal(HttpStatusCode.OK, getUserRankings.StatusCode);

        var getRanking = await client.GetAsync($"/api/Rank/GetRanking/{rankingId}");
        Assert.Equal(HttpStatusCode.OK, getRanking.StatusCode);

        var editRanking = await client.PutAsJsonAsync($"/api/Rank/EditRanking/{rankingId}", new
        {
            id = rankingId,
            title = "Top Languages Updated",
            description = "updated description",
            isPublic = true,
            items = new[]
            {
                new { id = "item-1", name = "C# 12", description = "updated", rank = 2u },
                new { id = "item-2", name = "TypeScript", description = "frontend", rank = 1u }
            }
        });
        Assert.Equal(HttpStatusCode.OK, editRanking.StatusCode);

        var createRankItem = await client.PostAsJsonAsync("/api/Rank/CreateRankItem", new
        {
            rankingId,
            item = new { id = "item-3", name = "Go", description = "systems", rank = 3u }
        });
        Assert.Equal(HttpStatusCode.OK, createRankItem.StatusCode);

        var editRankItem = await client.PutAsJsonAsync("/api/Rank/EditRankItem/item-3", new
        {
            rankingId,
            name = "GoLang",
            description = "systems-updated",
            rank = 2u
        });
        Assert.Equal(HttpStatusCode.OK, editRankItem.StatusCode);

        var updatePlacement = await client.PostAsJsonAsync($"/api/Rank/UpdateRankItemsPlacement/{rankingId}", new
        {
            rankingId,
            itemIdToRank = new Dictionary<string, int>
            {
                ["item-1"] = 3,
                ["item-2"] = 1,
                ["item-3"] = 2
            }
        });
        Assert.Equal(HttpStatusCode.OK, updatePlacement.StatusCode);

        var deleteRankItem = await client.PostAsJsonAsync("/api/Rank/DeleteRankItem/item-3", new
        {
            rankingId,
            rankItemId = "item-3"
        });
        Assert.Equal(HttpStatusCode.OK, deleteRankItem.StatusCode);

        var createPublicRanking = await client.PostAsJsonAsync("/api/Rank/CreateRanking", new
        {
            title = "Public Ranking",
            description = "visible",
            isPublic = true,
            items = new[]
            {
                new { id = "pub-1", name = "Public item", description = "desc", rank = 1u }
            }
        });
        Assert.Equal(HttpStatusCode.OK, createPublicRanking.StatusCode);
        var publicRankingId = await ReadStringPath(createPublicRanking, "id");

        var getPublicRankings = await client.GetAsync("/api/Rank/GetPublicRankings");
        Assert.Equal(HttpStatusCode.OK, getPublicRankings.StatusCode);
        var publicIds = await ReadArrayStringPath(getPublicRankings, "id");
        Assert.Contains(publicRankingId, publicIds);

        var deleteRanking = await client.DeleteAsync($"/api/Rank/DeleteRanking/{rankingId}");
        Assert.Equal(HttpStatusCode.OK, deleteRanking.StatusCode);
    }

    [Fact]
    public async Task ShareFlow_GetShareableLink_GetSharedRanking_CloneSharedRanking_Work()
    {
        await using var app = new SimpleRankWebApplicationFactory();

        using var ownerClient = app.CreateClient();
        await SignUpAndAuthenticate(ownerClient);

        var createRankingResponse = await ownerClient.PostAsJsonAsync("/api/Rank/CreateRanking", new
        {
            title = "Share source",
            description = "to clone",
            isPublic = true,
            items = new[]
            {
                new { id = "share-1", name = "A", description = "AA", rank = 1u }
            }
        });
        Assert.Equal(HttpStatusCode.OK, createRankingResponse.StatusCode);
        var rankingId = await ReadStringPath(createRankingResponse, "id");

        var shareableLinkResponse = await ownerClient.PostAsync($"/api/Rank/GetShareableLink/{rankingId}", null);
        Assert.Equal(HttpStatusCode.OK, shareableLinkResponse.StatusCode);
        var sharedId = await ReadStringPath(shareableLinkResponse, "shareableId");

        var getSharedRankingResponse = await ownerClient.GetAsync($"/api/Rank/GetSharedRanking/{sharedId}");
        Assert.Equal(HttpStatusCode.OK, getSharedRankingResponse.StatusCode);

        using var clonerClient = app.CreateClient();
        var clonerAuth = await SignUpAndAuthenticate(clonerClient);

        var cloneResponse = await clonerClient.PostAsync($"/api/Rank/CloneSharedRanking/{sharedId}", null);
        Assert.Equal(HttpStatusCode.OK, cloneResponse.StatusCode);
        var clonedRankingId = await ReadStringPath(cloneResponse, "id");

        var clonerRankings = await clonerClient.GetAsync($"/api/Rank/GetUserRankings/{clonerAuth.UserId}");
        Assert.Equal(HttpStatusCode.OK, clonerRankings.StatusCode);
        var clonerRankingIds = await ReadArrayStringPath(clonerRankings, "id");
        Assert.Contains(clonedRankingId, clonerRankingIds);
    }

    [Fact]
    public async Task StatisticEndpoints_GetCounts_RecordView_React_Get_Work()
    {
        await using var app = new SimpleRankWebApplicationFactory();
        using var client = app.CreateClient();

        await SignUpAndAuthenticate(client);

        var createRankingResponse = await client.PostAsJsonAsync("/api/Rank/CreateRanking", new
        {
            title = "Stats ranking",
            description = "stats",
            isPublic = true,
            items = new[]
            {
                new { id = "stats-1", name = "One", description = "Desc", rank = 1u }
            }
        });
        Assert.Equal(HttpStatusCode.OK, createRankingResponse.StatusCode);
        var rankingId = await ReadStringPath(createRankingResponse, "id");

        var rankingsCountResponse = await client.GetAsync("/api/Statistic/GetRankingsCount");
        Assert.Equal(HttpStatusCode.OK, rankingsCountResponse.StatusCode);
        var rankingsCount = await ReadIntPath(rankingsCountResponse, "totalCount");
        Assert.True(rankingsCount >= 1);

        var userCountResponse = await client.GetAsync("/api/Statistic/GetUserCount");
        Assert.Equal(HttpStatusCode.OK, userCountResponse.StatusCode);
        var userCount = await ReadIntPath(userCountResponse, "totalCount");
        Assert.True(userCount >= 1);

        var recordViewResponse = await client.PostAsJsonAsync($"/api/Statistic/RecordView/{rankingId}", new
        {
            rankingId,
            reactionId = "VIEW",
            isShared = false
        });
        Assert.Equal(HttpStatusCode.OK, recordViewResponse.StatusCode);

        var reactResponse = await client.PostAsJsonAsync($"/api/Statistic/React/{rankingId}", new
        {
            rankingId,
            reactionId = "LOVE",
            isShared = false
        });
        Assert.Equal(HttpStatusCode.OK, reactResponse.StatusCode);

        var getStatsResponse = await client.GetAsync($"/api/Statistic/Get/{rankingId}");
        Assert.Equal(HttpStatusCode.OK, getStatsResponse.StatusCode);

        using var statsJson = await JsonDocument.ParseAsync(await getStatsResponse.Content.ReadAsStreamAsync());
        var stats = statsJson.RootElement.GetProperty("statistics");
        Assert.True(stats.GetProperty("VIEW").GetInt32() >= 1);
        Assert.True(stats.GetProperty("LOVE").GetInt32() >= 1);
    }

    [Fact]
    public async Task Authorization_UserBCannotEditOrDeleteUserARanking()
    {
        await using var app = new SimpleRankWebApplicationFactory();

        using var ownerClient = app.CreateClient();
        await SignUpAndAuthenticate(ownerClient);

        var createRankingResponse = await ownerClient.PostAsJsonAsync("/api/Rank/CreateRanking", new
        {
            title = "Protected ranking",
            description = "owner only",
            isPublic = false,
            items = new[]
            {
                new { id = "owner-1", name = "Secret", description = "desc", rank = 1u }
            }
        });
        Assert.Equal(HttpStatusCode.OK, createRankingResponse.StatusCode);
        var rankingId = await ReadStringPath(createRankingResponse, "id");

        using var otherClient = app.CreateClient();
        await SignUpAndAuthenticate(otherClient);

        var editAttempt = await otherClient.PutAsJsonAsync($"/api/Rank/EditRanking/{rankingId}", new
        {
            id = rankingId,
            title = "hijack",
            description = "hijack",
            isPublic = true,
            items = Array.Empty<object>()
        });
        Assert.Contains(editAttempt.StatusCode, new[] { HttpStatusCode.Forbidden, HttpStatusCode.NotFound });

        var deleteAttempt = await otherClient.DeleteAsync($"/api/Rank/DeleteRanking/{rankingId}");
        Assert.Contains(deleteAttempt.StatusCode, new[] { HttpStatusCode.Forbidden, HttpStatusCode.NotFound });
    }

    private static async Task<AuthContext> SignUpAndAuthenticate(HttpClient client)
    {
        var email = UniqueEmail();
        var userId = $"user_{Guid.NewGuid():N}";
        var token = SimpleRankWebApplicationFactory.CreateToken(userId, email);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        (await client.PostAsync("/api/Auth/Sync", null)).EnsureSuccessStatusCode();
        return new AuthContext(token, userId, email);
    }

    private static string UniqueEmail() => $"tester-{Guid.NewGuid():N}@example.com";

    private static async Task<string> ReadStringPath(HttpResponseMessage response, string propertyName)
    {
        using var json = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
        return json.RootElement.GetProperty(propertyName).GetString()!;
    }

    private static async Task<int> ReadIntPath(HttpResponseMessage response, string propertyName)
    {
        using var json = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
        return json.RootElement.GetProperty(propertyName).GetInt32();
    }

    private static async Task<List<string>> ReadArrayStringPath(HttpResponseMessage response, string propertyName)
    {
        using var json = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
        return json.RootElement
            .EnumerateArray()
            .Select(e => e.GetProperty(propertyName).GetString()!)
            .ToList();
    }

    private sealed record AuthContext(string AccessToken, string UserId, string Email);
}

public sealed class SimpleRankWebApplicationFactory : WebApplicationFactory<Program>
{
    private static readonly RSA SigningKey = RSA.Create(2048);
    private readonly string _dbPath;

    public static string CreateToken(string clerkId, string email, string? mappedId = null, string issuer = "https://clerk.example.test", DateTime? expires = null, string party = "http://localhost:5173", string? status = null, RSA? signingKey = null)
    {
        var claims = new List<Claim>
        {
            new("sub", clerkId), new("sid", "sess_test"), new("userId", mappedId ?? clerkId),
            new("primaryEmail", email), new("azp", party)
        };
        if (status is not null) claims.Add(new Claim("sts", status));
        var token = new JwtSecurityToken(issuer, claims: claims, expires: expires ?? DateTime.UtcNow.AddMinutes(5),
            signingCredentials: new SigningCredentials(new RsaSecurityKey(signingKey ?? SigningKey), SecurityAlgorithms.RsaSha256));
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public SimpleRankWebApplicationFactory()
    {
        var testDbDir = Path.Combine(AppContext.BaseDirectory, "testDbs");
        Directory.CreateDirectory(testDbDir);
        _dbPath = Path.Combine(testDbDir, $"simple-rank-{Guid.NewGuid():N}.db");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration((_, configBuilder) =>
        {
            configBuilder.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["DatabaseProvider"] = "Sqlite",
                ["ConnectionStrings:DefaultConnection"] = $"Data Source={_dbPath}",
                ["Clerk:Issuer"] = "https://clerk.example.test",
                ["Clerk:JwtPublicKey"] = SigningKey.ExportSubjectPublicKeyInfoPem(),
                ["Clerk:AuthorizedParties:0"] = "http://localhost:5173"
            });
        });

        builder.ConfigureServices(services =>
        {
            services.RemoveAll(typeof(DbContextOptions<AppDbContext>));
            services.RemoveAll(typeof(AppDbContext));

            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseSqlite($"Data Source={_dbPath}");
            });
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);

        if (File.Exists(_dbPath))
        {
            try
            {
                File.Delete(_dbPath);
            }
            catch
            {
                // Best-effort cleanup.
            }
        }
    }
}
