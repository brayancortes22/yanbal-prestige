using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using YanbalPrestige.Api.Data;
using YanbalPrestige.Api.DTOs;
using YanbalPrestige.Api.Entities;
using YanbalPrestige.Api.Services.Interfaces;

namespace YanbalPrestige.Api.Services.Implementations;

public class CatalogService : ICatalogService
{
    private readonly AppDbContext _context;
    private readonly IMediaStorageService _mediaService;

    public CatalogService(AppDbContext context, IMediaStorageService mediaService)
    {
        _context = context;
        _mediaService = mediaService;
    }

    public async Task<List<Product>> GetProductsAsync(ProductFilterDto filter)
    {
        // Include de la categoría: la etiqueta ya no se guarda duplicada.
        IQueryable<Product> query = _context.Products.AsNoTracking().Include(p => p.CategoryRef);

        if (filter.OnlyActive)
        {
            query = query.Where(p => p.IsActive);
        }

        if (!string.IsNullOrWhiteSpace(filter.Category) && filter.Category.ToLower() != "all")
        {
            query = query.Where(p => p.Category == filter.Category);
        }

        if (!string.IsNullOrWhiteSpace(filter.Query))
        {
            var term = filter.Query.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(term)
                                  || p.Code.ToLower().Contains(term)
                                  || p.Description.ToLower().Contains(term));
        }

        var products = await query.ToListAsync();
        HydrateMedia(products);
        return products;
    }

    public async Task<Product?> GetProductByIdAsync(string id)
    {
        var product = await _context.Products.AsNoTracking()
            .Include(p => p.CategoryRef)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product != null) HydrateMedia(new[] { product });
        return product;
    }

    private static List<ProductMedia> ParseMedia(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new List<ProductMedia>();
        try
        {
            return JsonSerializer.Deserialize<List<ProductMedia>>(json) ?? new List<ProductMedia>();
        }
        catch (JsonException)
        {
            return new List<ProductMedia>();
        }
    }

    private static void HydrateMedia(IEnumerable<Product> products)
    {
        foreach (var product in products)
        {
            product.Media = ParseMedia(product.MediaJson);
        }
    }

    public async Task<Product> SaveProductAsync(ProductCreateUpdateDto dto)
    {
        var newMedia = SanitizeMedia(dto.Media);

        var product = new Product
        {
            Id = string.IsNullOrWhiteSpace(dto.Id) ? Guid.NewGuid().ToString() : dto.Id,
            Code = dto.Code.Trim(),
            Name = dto.Name.Trim(),
            Category = dto.Category.Trim(),
            Price = dto.Price,
            OriginalPrice = dto.OriginalPrice,
            Image = dto.Image,
            Description = dto.Description,
            Badge = dto.Badge,
            UsageStepsJson = dto.UsageStepsJson,
            ConsultantTip = dto.ConsultantTip,
            BotanicalTitle = dto.BotanicalTitle,
            BotanicalDesc = dto.BotanicalDesc,
            WarrantyTitle = dto.WarrantyTitle,
            WarrantyDesc = dto.WarrantyDesc,
            CommitmentTitle = dto.CommitmentTitle,
            CommitmentText = dto.CommitmentText,
            IsActive = dto.IsActive,
            // Si el cliente no envía la galería, se conserva la existente.
            MediaJson = dto.Media == null
                ? "[]"
                : JsonSerializer.Serialize(newMedia),
            Media = dto.Media == null ? new List<ProductMedia>() : newMedia,
        };

        // Garantiza la integridad referencial: la categoría debe existir.
        var category = await _context.ProductCategories.FindAsync(product.Category);
        if (category == null)
        {
            category = new ProductCategory
            {
                Code = product.Category,
                Label = string.IsNullOrWhiteSpace(dto.CategoryLabel)
                    ? product.Category
                    : dto.CategoryLabel.Trim(),
            };
            await _context.ProductCategories.AddAsync(category);
        }

        var existing = await _context.Products.FindAsync(product.Id);
        if (existing == null)
        {
            await _context.Products.AddAsync(product);
        }
        else
        {
            // Autolimpieza: purga la imagen física anterior si fue reemplazada.
            if (!string.IsNullOrWhiteSpace(existing.Image) &&
                existing.Image != product.Image &&
                existing.Image.Contains("/uploads/"))
            {
                _mediaService.DeleteFile(existing.Image);
            }

            // Si el cliente no envió galería, no se toca la que ya existe.
            if (dto.Media == null)
            {
                product.MediaJson = existing.MediaJson;
                product.Media = ParseMedia(existing.MediaJson);
            }
            else
            {
                // Purga los archivos de la galería que ya no están en la nueva
                // lista (fotos/videos retirados o reemplazados).
                var keep = new HashSet<string>(
                    newMedia.Select(m => m.Url),
                    StringComparer.OrdinalIgnoreCase);
                keep.Add(product.Image);

                foreach (var old in ParseMedia(existing.MediaJson))
                {
                    if (!keep.Contains(old.Url))
                        DeleteStoredFile(old.Url);
                }
            }

            _context.Entry(existing).CurrentValues.SetValues(product);
        }

        await _context.SaveChangesAsync();
        product.CategoryRef = category;
        return product;
    }

    public async Task<bool> ToggleProductStatusAsync(string id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return false;
        product.IsActive = !product.IsActive;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteProductAsync(string id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return false;

        // Autolimpieza completa: se borran la portada y todos los archivos de
        // la galería para no dejar basura en el almacenamiento del VPS.
        var toDelete = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            product.Image ?? string.Empty
        };
        foreach (var media in ParseMedia(product.MediaJson))
            toDelete.Add(media.Url);

        foreach (var url in toDelete)
            DeleteStoredFile(url);

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Normaliza la galería recibida: solo tipos válidos, URL no vacía,
    /// sin duplicados y como máximo 10 elementos.
    /// </summary>
    private static List<ProductMedia> SanitizeMedia(List<ProductMediaDto>? media)
    {
        if (media == null || media.Count == 0) return new List<ProductMedia>();

        var result = new List<ProductMedia>();
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var item in media)
        {
            if (item == null || string.IsNullOrWhiteSpace(item.Url)) continue;

            var url = item.Url.Trim();
            if (!seen.Add(url)) continue;

            var type = string.Equals(item.Type, "video", StringComparison.OrdinalIgnoreCase)
                ? "video"
                : "image";

            result.Add(new ProductMedia
            {
                Type = type,
                Url = url,
                Alt = string.IsNullOrWhiteSpace(item.Alt) ? null : item.Alt.Trim(),
            });

            if (result.Count == 10) break;
        }

        return result;
    }

    /// <summary>Borra del disco solo rutas servidas por /uploads/.</summary>
    private void DeleteStoredFile(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return;
        if (!url.Contains("/uploads/", StringComparison.OrdinalIgnoreCase)) return;

        try
        {
            _mediaService.DeleteFile(url);
        }
        catch
        {
            // Un archivo ya ausente no debe impedir borrar el producto.
        }
    }
}
