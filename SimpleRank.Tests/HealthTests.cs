using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace SimpleRank.Tests;

/// <summary>
/// cutoverNote.md / deployNote.md promise GET /health -> {"status":"healthy"}.
/// Uses the same WebApplicationFactory pattern as the other integration tests.
/// </summary>
public class HealthTests
{
    [Fact]
    public async Task Health_ReturnsHealthyJsonPayload()
    {
        await using var app = new SimpleRankWebApplicationFactory();
        using var client = app.CreateClient();

        var response = await client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Equal("{\"status\":\"healthy\"}", body);

        using var json = JsonDocument.Parse(body);
        Assert.Equal("healthy", json.RootElement.GetProperty("status").GetString());
    }
}