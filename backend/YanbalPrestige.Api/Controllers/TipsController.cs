using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using YanbalPrestige.Api.Common.Security;
using YanbalPrestige.Api.Entities;
using YanbalPrestige.Api.Services.Interfaces;

namespace YanbalPrestige.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TipsController : ControllerBase
{
    private readonly ITipService _tipService;
    private readonly IAuditService _audit;

    public TipsController(ITipService tipService, IAuditService audit)
    {
        _tipService = tipService;
        _audit = audit;
    }

    /// <summary>Listado público: solo consejos visibles.</summary>
    [HttpGet]
    [AllowAnonymous]
    [OutputCache(PolicyName = "PublicCatalog")]
    public async Task<IActionResult> GetPublished() => Ok(await _tipService.GetActiveTipsAsync());

    /// <summary>Listado completo para el panel de administración.</summary>
    [HttpGet("admin")]
    [Authorize(Roles = AuthRoles.ContentManagers)]
    public async Task<IActionResult> GetAll() => Ok(await _tipService.GetAllTipsAsync());

    /// <summary>Detalle público de un consejo.</summary>
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(string id)
    {
        var tip = await _tipService.GetTipByIdAsync(id);
        if (tip == null || !tip.IsActive) return NotFound(new { message = "Consejo no encontrado." });
        return Ok(tip);
    }

    [HttpPost]
    [Authorize(Roles = AuthRoles.ContentManagers)]
    public async Task<IActionResult> Save([FromBody] Tip tip)
    {
        if (string.IsNullOrWhiteSpace(tip.Title))
        {
            return BadRequest(new { message = "El título es obligatorio." });
        }

        var r = await _tipService.SaveTipAsync(tip);
        var actor = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        await _audit.LogAsync(actor, "GUARDAR_TIP", "consejos", r.Id, new { r.Title, r.Category }, ip);
        return Ok(r);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = AuthRoles.ContentManagers)]
    public async Task<IActionResult> Delete(string id)
    {
        var success = await _tipService.DeleteTipAsync(id);
        if (!success) return NotFound();
        var actor = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        await _audit.LogAsync(actor, "ELIMINAR_TIP", "consejos", id, null, ip);
        return Ok(new { success = true });
    }
}
