using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YanbalPrestige.Api.Entities;
using YanbalPrestige.Api.Services.Interfaces;

namespace YanbalPrestige.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Director,Consultant")]
public class CrmController : ControllerBase
{
    private readonly ICrmService _crmService;

    public CrmController(ICrmService crmService)
    {
        _crmService = crmService;
    }

    [HttpGet("clients")]
    public async Task<IActionResult> GetClients([FromQuery] string consultantId)
    {
        if (string.IsNullOrWhiteSpace(consultantId))
            return BadRequest(new { message = "consultantId es obligatorio." });

        var clients = await _crmService.GetClientsByConsultantAsync(consultantId);
        return Ok(clients);
    }

    [HttpPost("clients")]
    public async Task<IActionResult> SaveClient([FromBody] ConsultantClient client)
    {
        if (string.IsNullOrWhiteSpace(client.ConsultantId) || string.IsNullOrWhiteSpace(client.FullName))
            return BadRequest(new { message = "ConsultantId y Nombre Completo son requeridos." });

        var saved = await _crmService.SaveClientAsync(client);
        return Ok(saved);
    }

    [HttpDelete("clients/{id}")]
    public async Task<IActionResult> DeleteClient(string id, [FromQuery] string consultantId)
    {
        var success = await _crmService.DeleteClientAsync(id, consultantId);
        if (!success) return NotFound();
        return Ok(new { success = true });
    }
}
