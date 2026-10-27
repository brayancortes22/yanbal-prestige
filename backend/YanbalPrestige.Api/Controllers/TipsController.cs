using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

    public TipsController(ITipService tipService)
    {
        _tipService = tipService;
    }

    /// <summary>Listado público: solo consejos visibles.</summary>
    [HttpGet]
    [AllowAnonymous]
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

        return Ok(await _tipService.SaveTipAsync(tip));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = AuthRoles.ContentManagers)]
    public async Task<IActionResult> Delete(string id)
    {
        var success = await _tipService.DeleteTipAsync(id);
        if (!success) return NotFound();
        return Ok(new { success = true });
    }
}
