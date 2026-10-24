using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YanbalPrestige.Api.Data;
using YanbalPrestige.Api.Models;

namespace YanbalPrestige.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CatalogController : ControllerBase
{
    private readonly AppDbContext _context;

    public CatalogController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("products")]
    public async Task<IActionResult> GetProducts([FromQuery] string? category, [FromQuery] string? q)
    {
        var query = _context.Products.AsNoTracking().Where(p => p.IsActive);

        if (!string.IsNullOrWhiteSpace(category) && category != "all")
        {
            query = query.Where(p => p.Category == category);
        }

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(term) || p.Description.ToLower().Contains(term) || p.Code.ToLower().Contains(term));
        }

        var products = await query.ToListAsync();
        return Ok(products);
    }

    [HttpGet("products/{id}")]
    public async Task<IActionResult> GetProductById(string id)
    {
        var product = await _context.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id && p.IsActive);
        if (product == null) return NotFound(new { message = "Producto no encontrado" });
        return Ok(product);
    }

    // POST: api/catalog/products (Protegido por token de Directora / CMS)
    [HttpPost("products")]
    public async Task<IActionResult> SaveProduct([FromBody] Product product, [FromHeader(Name = "Authorization")] string? authHeader)
    {
        // Blindaje contra mutaciones no autorizadas
        if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.Contains("mock_jwt_token_yanbal_prestige_secure"))
        {
            return Unauthorized(new { message = "Acceso denegado. Se requiere token de Directora Administradora." });
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
        return Ok(product);
    }
}
