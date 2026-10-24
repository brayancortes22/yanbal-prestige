using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using YanbalPrestige.Api.Data;
using YanbalPrestige.Api.Entities;
using YanbalPrestige.Api.Services.Interfaces;

namespace YanbalPrestige.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeadsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ITurnstileService _turnstileService;

    public LeadsController(AppDbContext context, ITurnstileService turnstileService)
    {
        _context = context;
        _turnstileService = turnstileService;
    }

    [HttpPost("join")]
    [EnableRateLimiting("StrictLeadsLimiter")]
    public async Task<IActionResult> SubmitLead([FromBody] LeadProspect lead)
    {
        // 1. Trampa Honeypot: Detección anti-scrapers y bots (Regla 8)
        if (!string.IsNullOrWhiteSpace(lead.CompanyWebsite) || !string.IsNullOrWhiteSpace(lead.TrapField))
        {
            return BadRequest(new { message = "Detección de seguridad perimetral activada." });
        }

        // 2. Validación Cloudflare Turnstile Invisible (Regla 8)
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var isHuman = await _turnstileService.VerifyTokenAsync(lead.TurnstileToken, ip);
        if (!isHuman)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Validación de seguridad anti-bots fallida. Inténtelo nuevamente." });
        }

        // 3. Validación obligatoria Ley 1581 Habeas Data
        if (!lead.AcceptedHabeasData)
        {
            return BadRequest(new { message = "Debe aceptar la política de tratamiento de datos según Ley 1581." });
        }

        if (string.IsNullOrWhiteSpace(lead.FullName) || string.IsNullOrWhiteSpace(lead.Phone))
        {
            return BadRequest(new { message = "Nombre y WhatsApp son requeridos." });
        }

        // 4. Sanitización contra caracteres de control
        lead.FullName = lead.FullName.Trim();
        lead.Phone = lead.Phone.Trim();
        lead.City = lead.City.Trim();
        lead.CreatedAt = DateTime.UtcNow;

        await _context.Leads.AddAsync(lead);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Postulación registrada exitosamente." });
    }
}
