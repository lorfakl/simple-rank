using Microsoft.EntityFrameworkCore;
using simple_rank_backend.Models;

namespace simple_rank_backend.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<UserMetadata> UserMetadata => Set<UserMetadata>();
    public DbSet<Ranking> Rankings => Set<Ranking>();
    public DbSet<RankItem> RankItems => Set<RankItem>();
    public DbSet<ShareableLink> ShareableLinks => Set<ShareableLink>();
    public DbSet<StatisticEvent> StatisticEvents => Set<StatisticEvent>();
    public DbSet<ReactionHistory> ReactionHistories => Set<ReactionHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AppUser>().HasIndex(u => u.Email).IsUnique();

        modelBuilder.Entity<UserMetadata>()
            .HasKey(m => m.UserId);
        modelBuilder.Entity<UserMetadata>()
            .HasOne(m => m.User)
            .WithOne(u => u.Metadata)
            .HasForeignKey<UserMetadata>(m => m.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Ranking>()
            .HasOne(r => r.Owner)
            .WithMany()
            .HasForeignKey(r => r.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RankItem>()
            .HasKey(i => i.ItemId);
        modelBuilder.Entity<RankItem>()
            .HasOne(i => i.Ranking)
            .WithMany(r => r.Items)
            .HasForeignKey(i => i.RankingId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ShareableLink>()
            .HasKey(s => s.SharedId);
        modelBuilder.Entity<ShareableLink>()
            .HasIndex(s => s.RankingId)
            .IsUnique();
        modelBuilder.Entity<ShareableLink>()
            .HasOne(s => s.Ranking)
            .WithOne(r => r.ShareableLink)
            .HasForeignKey<ShareableLink>(s => s.RankingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
