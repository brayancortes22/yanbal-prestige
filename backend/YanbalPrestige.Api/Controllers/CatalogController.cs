using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using YanbalPrestige.Api.Common.Security;
using YanbalPrestige.Api.DTOs;
using YanbalPrestige.Api.Entities;
using YanbalPrestige.Api.Services.Interfaces;

namespace YanbalPrestige.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CatalogController : ControllerBase
{
    private readonly ICatalogService _catalogService;
    private readonly IOutputCacheStore _cache;
    private readonly IAuditService _audit;

    public CatalogController(ICatalogService catalogService, IOutputCacheStore cache, IAuditService audit)
    {
        _catalogService = catalogService;
        _cache = cache;
        _audit = audit;
    }

    private string CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.Identity?.Name ?? "directora";

    private Task EvictCatalogAsync() =>
        _cache.EvictByTagAsync("catalog", HttpContext.RequestAborted).AsTask();

    [HttpGet("products")]
    [AllowAnonymous]
    [OutputCache(PolicyName = "PublicCatalog")]
    public async Task<IActionResult> GetProducts([FromQuery] string? category, [FromQuery] string? q, [FromQuery] bool onlyActive = true)
    {
        var filter = new ProductFilterDto { Category = category, Query = q, OnlyActive = onlyActive };
        var products = await _catalogService.GetProductsAsync(filter);
        return Ok(products);
    }

    [HttpGet("products/{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetProductById(string id)
    {
        var product = await _catalogService.GetProductByIdAsync(id);
        if (product == null) return NotFound(new { message = "Producto no encontrado." });
        return Ok(product);
    }

    [HttpPost("products")]
    [Authorize(Roles = AuthRoles.ContentManagers)]
    public async Task<IActionResult> SaveProduct([FromBody] ProductCreateUpdateDto product)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var saved = await _catalogService.SaveProductAsync(product);
        await EvictCatalogAsync();

        await _audit.LogAsync(CurrentUserId, "GUARDAR_PRODUCTO", "productos", saved.Id,
            new { saved.Code, saved.Name, saved.Price, saved.Category }, ip);

        return Ok(saved);
    }

    [HttpPost("products/batch")]
    [Authorize(Roles = AuthRoles.ContentManagers)]
    public async Task<IActionResult> SaveProductBatch([FromBody] List<ProductCreateUpdateDto> products)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var savedList = new List<Product>();

        foreach (var p in products)
        {
            var saved = await _catalogService.SaveProductAsync(p);
            savedList.Add(saved);
        }

        await EvictCatalogAsync();

        await _audit.LogAsync(CurrentUserId, "IMPORTAR_LOTE_PRODUCTOS", "productos", null,
            new { totalImportados = savedList.Count, skus = savedList.Select(s => s.Code).Take(10).ToList() }, ip);

        return Ok(new { success = true, count = savedList.Count, products = savedList });
    }

    [HttpPatch("products/{id}/toggle")]
    [Authorize(Roles = AuthRoles.ContentManagers)]
    public async Task<IActionResult> ToggleProduct(string id)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var success = await _catalogService.ToggleProductStatusAsync(id);
        if (!success) return NotFound();
        await EvictCatalogAsync();

        await _audit.LogAsync(CurrentUserId, "TOGGLE_PRODUCTO", "productos", id, null, ip);
        return Ok(new { success = true });
    }

    [HttpDelete("products/{id}")]
    [Authorize(Roles = AuthRoles.ContentManagers)]
    public async Task<IActionResult> DeleteProduct(string id)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var success = await _catalogService.DeleteProductAsync(id);
        if (!success) return NotFound();
        await EvictCatalogAsync();

        await _audit.LogAsync(CurrentUserId, "ELIMINAR_PRODUCTO", "productos", id, null, ip);
        return Ok(new { success = true });
    }
}
