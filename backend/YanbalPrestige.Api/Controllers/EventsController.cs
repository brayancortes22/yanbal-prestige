using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YanbalPrestige.Api.Data;
using YanbalPrestige.Api.Models;

namespace YanbalPrestige.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly AppDbContext _context;

    public EventsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetEvents()
    {
        var events = await _context.Events.AsNoTracking().Where(e => e.IsActive).ToListAsync();
        return Ok(events);
    }

    [HttpPost]
    public async Task<IActionResult> SaveEvent([FromBody] EventItem ev, [FromHeader(Name = "Authorization")] string? authHeader)
    {
        if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.Contains("mock_jwt_token_yanbal_prestige_secure"))
        {
            return Unauthorized(new { message = "Acceso denegado. Se requiere token de Directora Administradora." });
        }

        var existing = await _context.Events.FindAsync(ev.Id);
        if (existing == null)
        {
            await _context.Events.AddAsync(ev);
        }
        else
        {
            _context.Entry(existing).CurrentValues.SetValues(ev);
        }

        await _context.SaveChangesAsync();
        return Ok(ev);
    }
}
