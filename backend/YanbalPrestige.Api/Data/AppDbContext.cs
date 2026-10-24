using Microsoft.EntityFrameworkCore;
using YanbalPrestige.Api.Models;

namespace YanbalPrestige.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<EventItem> Events => Set<EventItem>();
    public DbSet<LeadProspect> Leads => Set<LeadProspect>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasIndex(p => p.Category);
            entity.HasIndex(p => p.IsActive);
        });

        modelBuilder.Entity<EventItem>(entity =>
        {
            entity.HasIndex(e => e.IsActive);
        });
    }
}
