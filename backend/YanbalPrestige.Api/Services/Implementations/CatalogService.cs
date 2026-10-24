using Microsoft.EntityFrameworkCore;
using YanbalPrestige.Api.Data;
using YanbalPrestige.Api.DTOs;
using YanbalPrestige.Api.Entities;
using YanbalPrestige.Api.Services.Interfaces;

namespace YanbalPrestige.Api.Services.Implementations;

public class CatalogService : ICatalogService
{
    private readonly AppDbContext _context;

    public CatalogService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Product>> GetProductsAsync(ProductFilterDto filter)
    {
        var query = _context.Products.AsNoTracking();

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

        return await query.ToListAsync();
    }

    public async Task<Product?> GetProductByIdAsync(string id)
    {
        return await _context.Products.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Product> SaveProductAsync(Product product)
    {
        if (string.IsNullOrWhiteSpace(product.Id))
        {
            product.Id = Guid.NewGuid().ToString();
        }

        var existing = await _context.Products.FindAsync(product.Id);
        if (existing == null)
        {
            await _context.Products.AddAsync(product);
        }
        else
        {
            _context.Entry(existing).CurrentValues.SetValues(product);
        }

        await _context.SaveChangesAsync();
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
        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return true;
    }
}
