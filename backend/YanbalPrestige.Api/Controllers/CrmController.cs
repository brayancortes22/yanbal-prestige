using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YanbalPrestige.Api.Common.Security;
using YanbalPrestige.Api.Data;
using YanbalPrestige.Api.Entities;
using YanbalPrestige.Api.Services.Interfaces;

namespace YanbalPrestige.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = $"{AuthRoles.Director},{AuthRoles.Assistant},{AuthRoles.Leader},{AuthRoles.Consultant}")]
public class CrmController : ControllerBase
{
    private readonly ICrmService _crmService;
    private readonly AppDbContext _db;

    public CrmController(ICrmService crmService, AppDbContext db)
    {
        _crmService = crmService;
        _db = db;
    }

    private string CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;

    private bool IsDirector => User.IsInRole(AuthRoles.Director);

    private bool IsLeader => User.IsInRole(AuthRoles.Leader);

    /// <summary>
    /// Cartera visible para el usuario: toda la red para administración,
    /// el equipo para el líder y la propia para la consultora.
    /// </summary>
    [HttpGet("clients/all")]
    public async Task<IActionResult> GetAllClients()
    {
        if (IsDirector || User.IsInRole(AuthRoles.Assistant))
            return Ok(await _crmService.GetAllClientsAsync());

        if (IsLeader)
        {
            var teamIds = await _db.Users.AsNoTracking()
                .Where(u => u.LeaderId == CurrentUserId)
                .Select(u => u.Id)
                .ToListAsync();
            teamIds.Add(CurrentUserId);
            return Ok(await _crmService.GetClientsByConsultantsAsync(teamIds));
        }

        return Ok(await _crmService.GetClientsByConsultantAsync(CurrentUserId));
    }

    [HttpGet("clients")]
    public async Task<IActionResult> GetClients([FromQuery] string? consultantId)
    {
        // Una consultora no puede leer la cartera de otra pasando su id.
        // Un líder lee la cartera consolidada de su equipo.
        if (IsDirector)
        {
            if (string.IsNullOrWhiteSpace(consultantId))
                return BadRequest(new { message = "consultantId es obligatorio." });
            return Ok(await _crmService.GetClientsByConsultantAsync(consultantId));
        }

        if (IsLeader)
        {
            var teamIds = await _db.Users.AsNoTracking()
                .Where(u => u.LeaderId == CurrentUserId)
                .Select(u => u.Id)
                .ToListAsync();
            teamIds.Add(CurrentUserId);
            return Ok(await _crmService.GetClientsByConsultantsAsync(teamIds));
        }

        return Ok(await _crmService.GetClientsByConsultantAsync(CurrentUserId));
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
