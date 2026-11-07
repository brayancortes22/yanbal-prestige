using Microsoft.EntityFrameworkCore;
using YanbalPrestige.Api.Entities;

namespace YanbalPrestige.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductCategory> ProductCategories => Set<ProductCategory>();
    public DbSet<User> Users => Set<User>();
    public DbSet<ConsultantClient> ConsultantClients => Set<ConsultantClient>();
    public DbSet<PasswordResetPin> PasswordResetPins => Set<PasswordResetPin>();
    public DbSet<HeroSlide> HeroSlides => Set<HeroSlide>();
    public DbSet<DigitalCatalog> DigitalCatalogs => Set<DigitalCatalog>();
    public DbSet<VideoTip> VideoTips => Set<VideoTip>();
    public DbSet<Tip> Tips => Set<Tip>();
    public DbSet<EventItem> Events => Set<EventItem>();
    public DbSet<LeadProspect> Leads => Set<LeadProspect>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderPayment> OrderPayments => Set<OrderPayment>();

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

        // 3FN: la etiqueta de categoría vive solo en categorias_producto.
        modelBuilder.Entity<Product>()
            .HasOne(p => p.CategoryRef)
            .WithMany()
            .HasForeignKey(p => p.Category)
            .OnDelete(DeleteBehavior.Restrict);

        // Índice único en correos de usuarios
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Jerarquía líder -> consultoras (auto-relación).
        modelBuilder.Entity<User>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(u => u.LeaderId)
            // RESTRICT: no se puede borrar un líder con consultoras a cargo.
            .OnDelete(DeleteBehavior.Restrict);

        // Índice para búsqueda de clientas por consultora
        modelBuilder.Entity<ConsultantClient>()
            .HasIndex(c => c.ConsultantId);

        // Índice para búsqueda de PINs de recuperación
        modelBuilder.Entity<PasswordResetPin>()
            .HasIndex(p => new { p.UserId, p.PinCode, p.IsUsed });

        // Índice para el listado público de consejos (activos y ordenados)
        modelBuilder.Entity<Tip>()
            .HasIndex(t => new { t.IsActive, t.Order });

        // Índices de alto rendimiento para ventas y facturación
        modelBuilder.Entity<Order>()
            .HasIndex(o => o.InvoiceNumber)
            .IsUnique();

        modelBuilder.Entity<Order>()
            .HasIndex(o => o.ConsultantId);

        modelBuilder.Entity<Order>()
            .HasIndex(o => o.CreatedAt);

        modelBuilder.Entity<Order>()
            .HasIndex(o => o.PaymentStatus);

        modelBuilder.Entity<Order>()
            .HasIndex(o => o.DeliveryStatus);

        modelBuilder.Entity<Order>()
            .HasIndex(o => o.IdempotencyKey);

        modelBuilder.Entity<Order>()
            .HasMany(o => o.Items)
            .WithOne()
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OrderItem>()
            .HasIndex(i => i.OrderId);

        modelBuilder.Entity<OrderItem>()
            .HasIndex(i => i.ProductId);

        modelBuilder.Entity<Order>()
            .HasMany(o => o.Payments)
            .WithOne()
            .HasForeignKey(p => p.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OrderPayment>()
            .HasIndex(p => p.OrderId);
    }
}
