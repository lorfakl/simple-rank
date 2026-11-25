using Microsoft.EntityFrameworkCore;

namespace simple_rank_backend.Data;

public static class RankingEditHistoryMigration
{
    public static async Task ApplyAsync(AppDbContext db)
    {
        if (db.Database.IsSqlite())
        {
            await db.Database.ExecuteSqlRawAsync(@"
CREATE TABLE IF NOT EXISTS RankingEditHistories (
    Id TEXT NOT NULL PRIMARY KEY,
    RankingId TEXT NOT NULL,
    OwnerId TEXT NOT NULL,
    ActionType TEXT NOT NULL,
    Summary TEXT NOT NULL,
    SnapshotJson TEXT NOT NULL,
    CreatedAt TEXT NOT NULL,
    FOREIGN KEY (RankingId) REFERENCES Rankings (Id) ON DELETE CASCADE
);");

            await db.Database.ExecuteSqlRawAsync(@"
CREATE INDEX IF NOT EXISTS IX_RankingEditHistories_RankingId_CreatedAt
ON RankingEditHistories (RankingId, CreatedAt);");
            return;
        }

        if (db.Database.IsNpgsql())
        {
            await db.Database.ExecuteSqlRawAsync(@"
CREATE TABLE IF NOT EXISTS ""RankingEditHistories"" (
    ""Id"" text NOT NULL PRIMARY KEY,
    ""RankingId"" text NOT NULL,
    ""OwnerId"" text NOT NULL,
    ""ActionType"" text NOT NULL,
    ""Summary"" text NOT NULL,
    ""SnapshotJson"" text NOT NULL,
    ""CreatedAt"" timestamp with time zone NOT NULL,
    CONSTRAINT ""FK_RankingEditHistories_Rankings_RankingId"" FOREIGN KEY (""RankingId"") REFERENCES ""Rankings"" (""Id"") ON DELETE CASCADE
);");

            await db.Database.ExecuteSqlRawAsync(@"
CREATE INDEX IF NOT EXISTS ""IX_RankingEditHistories_RankingId_CreatedAt""
ON ""RankingEditHistories"" (""RankingId"", ""CreatedAt"");");
        }
    }
}
