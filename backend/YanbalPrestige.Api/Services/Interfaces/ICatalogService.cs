using YanbalPrestige.Api.DTOs;
using YanbalPrestige.Api.Entities;

namespace YanbalPrestige.Api.Services.Interfaces;

public interface ICatalogService
{
    Task<List<Product>> GetProductsAsync(ProductFilterDto filter);
    Task<Product?> GetProductByIdAsync(string id);
    Task<Product> SaveProductAsync(Product product);
    Task<bool> ToggleProductStatusAsync(string id);
    Task<bool> DeleteProductAsync(string id);
}
