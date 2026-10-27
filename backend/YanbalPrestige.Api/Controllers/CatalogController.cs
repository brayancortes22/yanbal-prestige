using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

    public CatalogController(ICatalogService catalogService)
    {
        _catalogService = catalogService;
    }

    [HttpGet("products")]
    [AllowAnonymous]
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
    public async Task<IActionResult> SaveProduct([FromBody] Product product)
    {
        var saved = await _catalogService.SaveProductAsync(product);
        return Ok(saved);
    }

    [HttpPatch("products/{id}/toggle")]
    [Authorize(Roles = AuthRoles.ContentManagers)]
    public async Task<IActionResult> ToggleProduct(string id)
    {
        var success = await _catalogService.ToggleProductStatusAsync(id);
        if (!success) return NotFound();
        return Ok(new { success = true });
    }

    [HttpDelete("products/{id}")]
    [Authorize(Roles = AuthRoles.ContentManagers)]
    public async Task<IActionResult> DeleteProduct(string id)
    {
        var success = await _catalogService.DeleteProductAsync(id);
        if (!success) return NotFound();
        return Ok(new { success = true });
    }
}
