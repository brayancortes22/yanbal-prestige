using Microsoft.EntityFrameworkCore;
using YanbalPrestige.Api.Entities;

namespace YanbalPrestige.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<User> Users => Set<User>();
    public DbSet<ConsultantClient> ConsultantClients => Set<ConsultantClient>();
    public DbSet<PasswordResetPin> PasswordResetPins => Set<PasswordResetPin>();
    public DbSet<HeroSlide> HeroSlides => Set<HeroSlide>();
    public DbSet<DigitalCatalog> DigitalCatalogs => Set<DigitalCatalog>();
    public DbSet<VideoTip> VideoTips => Set<VideoTip>();
    public DbSet<EventItem> Events => Set<EventItem>();
    public DbSet<LeadProspect> Leads => Set<LeadProspect>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Índices de alto rendimiento para el catálogo
        modelBuilder.Entity<Product>()
            .HasIndex(p => p.Code)
            .IsUnique();

        modelBuilder.Entity<Product>()
            .HasIndex(p => p.Category);

        modelBuilder.Entity<Product>()
            .HasIndex(p => p.IsActive);

        // Índice único en correos de usuarios
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Índice para búsqueda de clientas por consultora
        modelBuilder.Entity<ConsultantClient>()
            .HasIndex(c => c.ConsultantId);

        // Índice para búsqueda de PINs de recuperación
        modelBuilder.Entity<PasswordResetPin>()
            .HasIndex(p => new { p.UserId, p.PinCode, p.IsUsed });
    }
}
