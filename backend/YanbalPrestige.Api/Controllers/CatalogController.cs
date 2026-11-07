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

    public CatalogController(ICatalogService catalogService, IOutputCacheStore cache)
    {
        _catalogService = catalogService;
        _cache = cache;
    }

    /// <summary>Invalida el catálogo público tras crear, editar o borrar.</summary>
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
        var saved = await _catalogService.SaveProductAsync(product);
        await EvictCatalogAsync();
        return Ok(saved);
    }

    [HttpPatch("products/{id}/toggle")]
    [Authorize(Roles = AuthRoles.ContentManagers)]
    public async Task<IActionResult> ToggleProduct(string id)
    {
        var success = await _catalogService.ToggleProductStatusAsync(id);
        if (!success) return NotFound();
        await EvictCatalogAsync();
        return Ok(new { success = true });
    }

    [HttpDelete("products/{id}")]
    [Authorize(Roles = AuthRoles.ContentManagers)]
    public async Task<IActionResult> DeleteProduct(string id)
    {
        var success = await _catalogService.DeleteProductAsync(id);
        if (!success) return NotFound();
        await EvictCatalogAsync();
        return Ok(new { success = true });
    }
}
