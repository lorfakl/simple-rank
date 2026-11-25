using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using simple_rank_backend.Common;
using simple_rank_backend.Data;
using simple_rank_backend.DTOs;
using simple_rank_backend.Models;
using System.Security.Claims;
using System.Text.Json;

namespace simple_rank_backend.Controllers;

[ApiController]
[Route("api/[controller]/[action]")]
public class RankController(AppDbContext db) : ControllerBase
{
    [HttpOptions]
    public IActionResult Options() => Ok();

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateRanking([FromBody] CreateRankingRequest rq)
    {
        var ownerId = User.GetUserId();
        if (string.IsNullOrWhiteSpace(ownerId)) return Unauthorized();

        var ranking = new Ranking
        {
            OwnerId = ownerId,
            Title = rq.Title,
            Description = rq.Description,
            IsPublic = rq.IsPublic,
            IsShared = false,
            IsPinned = false,
            CreatedDate = DateTime.UtcNow,
            LastUpdated = DateTime.UtcNow,
            Items = rq.Items.Select(i => new RankItem
            {
                ItemId = string.IsNullOrWhiteSpace(i.Id) ? Guid.NewGuid().ToString() : i.Id,
                Name = i.Name,
                Description = i.Description,
                Rank = i.Rank,
            }).OrderBy(i => i.Rank).ToList()
        };

        db.Rankings.Add(ranking);
        RecordRankingEdit(ranking, ownerId, "create", "Created ranking");
        await db.SaveChangesAsync();

        return Ok(new CreateRankingResponse { Id = ranking.Id, Message = "Successfully created ranking" });
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateRankItem([FromBody] CreateRankingItemRequest rq)
    {
        var ownerId = User.GetUserId();
        if (string.IsNullOrWhiteSpace(ownerId)) return Unauthorized();

        var ranking = await db.Rankings.Include(r => r.Items).FirstOrDefaultAsync(r => r.Id == rq.RankingId && r.OwnerId == ownerId);
        if (ranking is null) return NotFound();

        var item = new RankItem
        {
            ItemId = string.IsNullOrWhiteSpace(rq.Item.Id) ? Guid.NewGuid().ToString() : rq.Item.Id,
            RankingId = ranking.Id,
            Name = rq.Item.Name,
            Description = rq.Item.Description,
            Rank = rq.Item.Rank
        };

        db.RankItems.Add(item);
        ranking.LastUpdated = DateTime.UtcNow;
        RecordRankingEdit(ranking, ownerId, "add-item", $"Added item '{item.Name}'");
        await db.SaveChangesAsync();

        return Ok(new ResponseBase { Message = "Create rank item success" });
    }

    [Authorize]
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetUserRankings(string userId)
    {
        var ownerId = User.GetUserId();
        if (string.IsNullOrWhiteSpace(ownerId)) return Unauthorized();
        if (ownerId != userId) return Forbid();

        var rankings = await db.Rankings
            .Include(r => r.Items)
            .Where(r => r.OwnerId == userId)
            .OrderByDescending(r => r.IsPinned)
            .ThenBy(r => r.PinnedTime)
            .ThenByDescending(r => r.LastUpdated)
            .ToListAsync();

        var userMeta = await db.UserMetadata.FirstOrDefaultAsync(m => m.UserId == userId);
        return Ok(rankings.Select(r => MapRanking(r, userMeta)));
    }

    [Authorize]
    [HttpGet("{rankingId}")]
    public async Task<IActionResult> GetRanking(string rankingId)
    {
        var ownerId = User.GetUserId();
        if (string.IsNullOrWhiteSpace(ownerId)) return Unauthorized();

        var ranking = await db.Rankings.Include(r => r.Items).FirstOrDefaultAsync(r => r.Id == rankingId && r.OwnerId == ownerId);
        if (ranking is null) return NotFound();

        var userMeta = await db.UserMetadata.FirstOrDefaultAsync(m => m.UserId == ranking.OwnerId);
        return Ok(MapRanking(ranking, userMeta));
    }

    [Authorize]
    [HttpPost("{rankingId}")]
    public async Task<IActionResult> GetShareableLink(string rankingId)
    {
        var ownerId = User.GetUserId();
        if (string.IsNullOrWhiteSpace(ownerId)) return Unauthorized();

        var ranking = await db.Rankings.Include(r => r.ShareableLink).FirstOrDefaultAsync(r => r.Id == rankingId && r.OwnerId == ownerId);
        if (ranking is null) return NotFound();

        if (ranking.ShareableLink is null)
        {
            ranking.ShareableLink = new ShareableLink { RankingId = ranking.Id };
            ranking.IsShared = true;
            ranking.LastUpdated = DateTime.UtcNow;
            db.ShareableLinks.Add(ranking.ShareableLink);
            await db.SaveChangesAsync();
        }

        return Ok(new ShareableLinkResponse { ShareableId = ranking.ShareableLink.SharedId });
    }

    [HttpGet("{rankingId}")]
    public async Task<IActionResult> GetSharedRanking(string rankingId)
    {
        var link = await db.ShareableLinks.FirstOrDefaultAsync(s => s.SharedId == rankingId);
        if (link is null) return NotFound();

        var ranking = await db.Rankings.Include(r => r.Items).FirstOrDefaultAsync(r => r.Id == link.RankingId);
        if (ranking is null) return NotFound();

        var userMeta = await db.UserMetadata.FirstOrDefaultAsync(m => m.UserId == ranking.OwnerId);
        return Ok(MapRanking(ranking, userMeta));
    }

    [Authorize]
    [HttpPut("{rankingId}")]
    public async Task<IActionResult> EditRanking(string rankingId, [FromBody] UpdateRankingRequest rq)
    {
        var ownerId = User.GetUserId();
        if (string.IsNullOrWhiteSpace(ownerId)) return Unauthorized();

        var ranking = await db.Rankings.Include(r => r.Items).FirstOrDefaultAsync(r => r.Id == rankingId && r.OwnerId == ownerId);
        if (ranking is null) return NotFound();

        var summaryParts = new List<string>();

        if (!string.Equals(ranking.Title, rq.Title, StringComparison.Ordinal))
        {
            summaryParts.Add($"Renamed ranking to '{rq.Title}'");
        }

        ranking.Title = rq.Title;
        ranking.Description = rq.Description;
        ranking.IsPublic = rq.IsPublic;
        ranking.LastUpdated = DateTime.UtcNow;

        if (rq.Items.Count > 0)
        {
            var incomingById = rq.Items.ToDictionary(i => i.Id, i => i);
            var existingIds = ranking.Items.Select(i => i.ItemId).ToHashSet();

            var removed = ranking.Items.Where(i => !incomingById.ContainsKey(i.ItemId)).ToList();
            if (removed.Count > 0)
            {
                db.RankItems.RemoveRange(removed);
                summaryParts.Add($"Removed {removed.Count} item(s)");
            }

            foreach (var existing in ranking.Items)
            {
                if (incomingById.TryGetValue(existing.ItemId, out var incoming))
                {
                    if (existing.Rank != incoming.Rank)
                    {
                        summaryParts.Add("Reordered items");
                    }

                    existing.Name = incoming.Name;
                    existing.Description = incoming.Description;
                    existing.Rank = incoming.Rank;
                }
            }

            var toAdd = rq.Items.Where(i => !existingIds.Contains(i.Id)).Select(i => new RankItem
            {
                ItemId = string.IsNullOrWhiteSpace(i.Id) ? Guid.NewGuid().ToString() : i.Id,
                RankingId = ranking.Id,
                Name = i.Name,
                Description = i.Description,
                Rank = i.Rank
            }).ToList();

            if (toAdd.Count > 0)
            {
                db.RankItems.AddRange(toAdd);
                summaryParts.Add($"Added {toAdd.Count} item(s)");
            }
        }

        var summary = summaryParts.Count == 0 ? "Edited ranking" : string.Join("; ", summaryParts.Distinct());
        RecordRankingEdit(ranking, ownerId, "edit", summary);

        await db.SaveChangesAsync();
        return Ok(new ResponseBase { Message = "successfully updated rank items" });
    }

    [Authorize]
    [HttpPost("{rankingId}")]
    public async Task<IActionResult> UpdateRankItemsPlacement(string rankingId, [FromBody] UpdateRankItemPlacementRequest rq)
    {
        var ownerId = User.GetUserId();
        if (string.IsNullOrWhiteSpace(ownerId)) return Unauthorized();

        var ranking = await db.Rankings.Include(r => r.Items).FirstOrDefaultAsync(r => r.Id == rankingId && r.OwnerId == ownerId);
        if (ranking is null) return NotFound();

        foreach (var item in ranking.Items)
        {
            if (rq.ItemIdToRank.TryGetValue(item.ItemId, out var rank))
            {
                item.Rank = (uint)Math.Max(rank, 1);
            }
        }

        ranking.LastUpdated = DateTime.UtcNow;
        RecordRankingEdit(ranking, ownerId, "reorder", "Updated item order");
        await db.SaveChangesAsync();
        return Ok(new ResponseBase { Message = "successfully updated rank item placements" });
    }

    [Authorize]
    [HttpGet("{rankingId}")]
    public async Task<IActionResult> GetRankingEditHistory(string rankingId)
    {
        var ownerId = User.GetUserId();
        if (string.IsNullOrWhiteSpace(ownerId)) return Unauthorized();

        var ranking = await db.Rankings.FirstOrDefaultAsync(r => r.Id == rankingId && r.OwnerId == ownerId);
        if (ranking is null) return NotFound();

        var items = await db.RankingEditHistories
            .Where(h => h.RankingId == rankingId && h.OwnerId == ownerId)
            .OrderByDescending(h => h.CreatedAt)
            .Select(h => new RankingEditHistoryItemResponse
            {
                Id = h.Id,
                RankingId = h.RankingId,
                ActionType = h.ActionType,
                Summary = h.Summary,
                CreatedAt = h.CreatedAt
            })
            .ToListAsync();

        return Ok(new RankingEditHistoryResponse { Items = items });
    }

    [Authorize]
    [HttpPost("{rankingId}/{historyId}")]
    public async Task<IActionResult> RestoreRankingFromHistory(string rankingId, string historyId)
    {
        var ownerId = User.GetUserId();
        if (string.IsNullOrWhiteSpace(ownerId)) return Unauthorized();

        var ranking = await db.Rankings.Include(r => r.Items).FirstOrDefaultAsync(r => r.Id == rankingId && r.OwnerId == ownerId);
        if (ranking is null) return NotFound();

        var history = await db.RankingEditHistories.FirstOrDefaultAsync(h => h.Id == historyId && h.RankingId == rankingId && h.OwnerId == ownerId);
        if (history is null) return NotFound();

        RankingSnapshot? snapshot;
        try
        {
            snapshot = JsonSerializer.Deserialize<RankingSnapshot>(history.SnapshotJson);
        }
        catch (JsonException)
        {
            return BadRequest(new ResponseBase { Message = "invalid snapshot payload" });
        }

        if (snapshot is null)
        {
            return BadRequest(new ResponseBase { Message = "invalid snapshot payload" });
        }

        ranking.Title = snapshot.Title;
        ranking.Description = snapshot.Description;
        ranking.IsPublic = snapshot.IsPublic;
        ranking.LastUpdated = DateTime.UtcNow;

        var snapshotItems = snapshot.Items ?? [];
        var snapshotById = snapshotItems.ToDictionary(i => i.ItemId, i => i);

        var toRemove = ranking.Items.Where(i => !snapshotById.ContainsKey(i.ItemId)).ToList();
        if (toRemove.Count > 0)
        {
            db.RankItems.RemoveRange(toRemove);
        }

        foreach (var existing in ranking.Items)
        {
            if (snapshotById.TryGetValue(existing.ItemId, out var incoming))
            {
                existing.Name = incoming.Name;
                existing.Description = incoming.Description;
                existing.Rank = incoming.Rank;
            }
        }

        var existingIds = ranking.Items.Select(i => i.ItemId).ToHashSet();
        var toAdd = snapshotItems.Where(i => !existingIds.Contains(i.ItemId)).Select(i => new RankItem
        {
            ItemId = i.ItemId,
            RankingId = ranking.Id,
            Name = i.Name,
            Description = i.Description,
            Rank = i.Rank
        }).ToList();

        if (toAdd.Count > 0)
        {
            db.RankItems.AddRange(toAdd);
        }

        RecordRankingEdit(ranking, ownerId, "restore", $"Restored from history entry {historyId}");
        await db.SaveChangesAsync();

        return Ok(new ResponseBase { Message = "successfully restored ranking snapshot" });
    }

    [Authorize]
    [HttpPost("{rankingId}")]
    public async Task<IActionResult> PinRanking([FromBody] PinRankingRequest rq, string rankingId)
    {
        var ownerId = User.GetUserId();
        if (string.IsNullOrWhiteSpace(ownerId)) return Unauthorized();

        var ranking = await db.Rankings.FirstOrDefaultAsync(r => r.Id == rankingId && r.OwnerId == ownerId);
        if (ranking is null) return NotFound();

        ranking.IsPinned = rq.PinOperation;
        ranking.PinnedTime = DateTime.UtcNow;
        ranking.LastUpdated = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new ResponseBase { Message = rq.PinOperation ? "Successfully pinned ranking" : "Successfully unpinned ranking" });
    }

    [Authorize]
    [HttpDelete("{rankingId}")]
    public async Task<IActionResult> DeleteRanking(string rankingId)
    {
        var ownerId = User.GetUserId();
        if (string.IsNullOrWhiteSpace(ownerId)) return Unauthorized();

        var ranking = await db.Rankings.FirstOrDefaultAsync(r => r.Id == rankingId && r.OwnerId == ownerId);
        if (ranking is null) return NotFound();

        db.Rankings.Remove(ranking);
        await db.SaveChangesAsync();
        return Ok(new ResponseBase { Message = $"Successfully deleted ranking: {rankingId}" });
    }

    [Authorize]
    [HttpPost("{rankItemId}")]
    public async Task<IActionResult> DeleteRankItem([FromBody] DeleteRankItemRequest rq)
    {
        var ownerId = User.GetUserId();
        if (string.IsNullOrWhiteSpace(ownerId)) return Unauthorized();

        var ranking = await db.Rankings.FirstOrDefaultAsync(r => r.Id == rq.RankingId && r.OwnerId == ownerId);
        if (ranking is null) return NotFound();

        var item = await db.RankItems.FirstOrDefaultAsync(i => i.ItemId == rq.RankItemId && i.RankingId == rq.RankingId);
        if (item is null) return NotFound();

        db.RankItems.Remove(item);
        ranking.LastUpdated = DateTime.UtcNow;
        RecordRankingEdit(ranking, ownerId, "remove-item", $"Removed item '{item.Name}'");
        await db.SaveChangesAsync();
        return Ok(new ResponseBase { Message = "removed rank item" });
    }

    [Authorize]
    [HttpPut("{rankItemId}")]
    public async Task<IActionResult> EditRankItem(string rankItemId, [FromBody] EditRankItemRequest rq)
    {
        var ownerId = User.GetUserId();
        if (string.IsNullOrWhiteSpace(ownerId)) return Unauthorized();

        var item = await db.RankItems
            .Include(i => i.Ranking)
            .FirstOrDefaultAsync(i => i.ItemId == rankItemId && i.Ranking != null && i.Ranking.OwnerId == ownerId);

        if (item is null || item.Ranking is null) return NotFound();
        if (!string.IsNullOrWhiteSpace(rq.RankingId) && rq.RankingId != item.RankingId) return BadRequest();

        item.Name = rq.Name;
        item.Description = rq.Description;
        item.Rank = rq.Rank;
        item.Ranking.LastUpdated = DateTime.UtcNow;
        RecordRankingEdit(item.Ranking, ownerId, "edit-item", $"Edited item '{rq.Name}'");

        await db.SaveChangesAsync();
        return Ok(new ResponseBase { Message = "updated rank item" });
    }

    [Authorize]
    [HttpPost("{sharedId}")]
    public async Task<IActionResult> CloneSharedRanking(string sharedId)
    {
        var ownerId = User.GetUserId();
        if (string.IsNullOrWhiteSpace(ownerId)) return Unauthorized();

        var link = await db.ShareableLinks.FirstOrDefaultAsync(s => s.SharedId == sharedId);
        if (link is null) return NotFound();

        var source = await db.Rankings.Include(r => r.Items).FirstOrDefaultAsync(r => r.Id == link.RankingId);
        if (source is null) return NotFound();

        var clone = new Ranking
        {
            OwnerId = ownerId,
            Title = source.Title,
            Description = source.Description,
            IsPublic = false,
            IsShared = false,
            IsPinned = false,
            CreatedDate = DateTime.UtcNow,
            LastUpdated = DateTime.UtcNow,
            Items = source.Items.Select(i => new RankItem
            {
                ItemId = Guid.NewGuid().ToString(),
                Name = i.Name,
                Description = i.Description,
                Rank = i.Rank
            }).OrderBy(i => i.Rank).ToList()
        };

        db.Rankings.Add(clone);
        db.StatisticEvents.Add(new StatisticEvent
        {
            RankingId = source.Id,
            UserId = ownerId,
            Name = Statistics.CLONE.ToString(),
            Value = 1
        });

        await db.SaveChangesAsync();
        return Ok(new CreateRankingResponse { Id = clone.Id, Message = "Successfully cloned ranking" });
    }

    [HttpGet]
    public async Task<IActionResult> GetPublicRankings()
    {
        var rankings = await db.Rankings.Include(r => r.Items).Where(r => r.IsPublic).ToListAsync();
        var ownerIds = rankings.Select(r => r.OwnerId).Distinct().ToList();
        var metas = await db.UserMetadata.Where(m => ownerIds.Contains(m.UserId)).ToDictionaryAsync(m => m.UserId, m => m);
        return Ok(rankings.Select(r => MapRanking(r, metas.TryGetValue(r.OwnerId, out var m) ? m : null)));
    }

    private void RecordRankingEdit(Ranking ranking, string ownerId, string actionType, string summary)
    {
        var snapshot = new RankingSnapshot
        {
            Title = ranking.Title,
            Description = ranking.Description,
            IsPublic = ranking.IsPublic,
            Items = ranking.Items
                .OrderBy(i => i.Rank)
                .Select(i => new RankingSnapshotItem
                {
                    ItemId = i.ItemId,
                    Name = i.Name,
                    Description = i.Description,
                    Rank = i.Rank
                }).ToList()
        };

        db.RankingEditHistories.Add(new RankingEditHistory
        {
            RankingId = ranking.Id,
            OwnerId = ownerId,
            ActionType = actionType,
            Summary = summary,
            SnapshotJson = JsonSerializer.Serialize(snapshot),
            CreatedAt = DateTime.UtcNow
        });
    }

    private sealed class RankingSnapshot
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
        public List<RankingSnapshotItem> Items { get; set; } = [];
    }

    private sealed class RankingSnapshotItem
    {
        public string ItemId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public uint Rank { get; set; }
    }

    private static RankingResponse MapRanking(Ranking ranking, UserMetadata? meta)
    {
        return new RankingResponse
        {
            Id = ranking.Id,
            Owner = ranking.OwnerId,
            Title = ranking.Title,
            Description = ranking.Description,
            Items = ranking.Items.OrderBy(i => i.Rank).Select(i => new RankItemOutputDto
            {
                ItemId = i.ItemId,
                Name = i.Name,
                Description = i.Description,
                Rank = i.Rank
            }).ToList(),
            ItemCount = (uint)ranking.Items.Count,
            LastUpdated = ranking.LastUpdated,
            CreatedDate = ranking.CreatedDate,
            PinnedTime = ranking.PinnedTime,
            IsPublic = ranking.IsPublic,
            IsShared = ranking.IsShared,
            IsPinned = ranking.IsPinned,
            CreatedBy = new CreatedByDto
            {
                UserId = ranking.OwnerId,
                DisplayName = meta?.DisplayName ?? "unknown",
                AvatarUrl = meta?.AvatarUrl ?? string.Empty
            }
        };
    }
}
