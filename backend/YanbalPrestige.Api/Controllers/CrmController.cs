using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YanbalPrestige.Api.Common.Security;
using YanbalPrestige.Api.Entities;
using YanbalPrestige.Api.Services.Interfaces;

namespace YanbalPrestige.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = $"{AuthRoles.Director},{AuthRoles.Consultant}")]
public class CrmController : ControllerBase
{
    private readonly ICrmService _crmService;

    public CrmController(ICrmService crmService)
    {
        _crmService = crmService;
    }

    private string CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;

    private bool IsDirector => User.IsInRole(AuthRoles.Director);

    [HttpGet("clients")]
    public async Task<IActionResult> GetClients([FromQuery] string? consultantId)
    {
        // Una consultora no puede leer la cartera de otra pasando su id.
        var effectiveId = IsDirector ? consultantId : CurrentUserId;
        if (string.IsNullOrWhiteSpace(effectiveId))
            return BadRequest(new { message = "consultantId es obligatorio." });

        var clients = await _crmService.GetClientsByConsultantAsync(effectiveId);
        return Ok(clients);
    }

    [HttpPost("clients")]
    public async Task<IActionResult> SaveClient([FromBody] ConsultantClient client)
    {
        if (!IsDirector)
            client.ConsultantId = CurrentUserId;

        if (string.IsNullOrWhiteSpace(client.ConsultantId) || string.IsNullOrWhiteSpace(client.FullName))
            return BadRequest(new { message = "ConsultantId y Nombre Completo son requeridos." });

        var saved = await _crmService.SaveClientAsync(client);
        return Ok(saved);
    }

    [HttpDelete("clients/{id}")]
    public async Task<IActionResult> DeleteClient(string id, [FromQuery] string? consultantId)
    {
        var effectiveId = IsDirector ? consultantId : CurrentUserId;
        if (string.IsNullOrWhiteSpace(effectiveId))
            return BadRequest(new { message = "consultantId es obligatorio." });

        var success = await _crmService.DeleteClientAsync(id, effectiveId);
        if (!success) return NotFound();
        return Ok(new { success = true });
    }
}
