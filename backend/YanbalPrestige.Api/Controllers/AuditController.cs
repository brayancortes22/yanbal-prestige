using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YanbalPrestige.Api.Common.Security;
using YanbalPrestige.Api.Services.Interfaces;

namespace YanbalPrestige.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = $"{AuthRoles.Director},{AuthRoles.Assistant}")]
public class AuditController : ControllerBase
{
    private readonly IAuditService _auditService;

    public AuditController(IAuditService auditService)
    {
        _auditService = auditService;
    }

    [HttpGet]
    public async Task<IActionResult> GetLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? entity = null,
        [FromQuery] string? action = null,
        [FromQuery] string? q = null)
    {
        var (total, data) = await _auditService.GetLogsAsync(page, pageSize, entity, action, q);
        return Ok(new { total, page, pageSize, data });
    }
}
