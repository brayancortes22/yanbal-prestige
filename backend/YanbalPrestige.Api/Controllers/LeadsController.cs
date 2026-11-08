using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using YanbalPrestige.Api.Common.Security;
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
    private readonly IAuditService _audit;

    public LeadsController(AppDbContext context, ITurnstileService turnstileService, IAuditService audit)
    {
        _context = context;
        _turnstileService = turnstileService;
        _audit = audit;
    }

    [HttpGet]
    [Authorize(Roles = $"{AuthRoles.Director},{AuthRoles.Assistant}")]
    public async Task<IActionResult> GetLeads()
    {
        var leads = await _context.Leads.AsNoTracking()
            .OrderByDescending(l => l.CreatedAt)
            .Take(500)
            .ToListAsync();
        return Ok(leads);
    }

    [HttpPost("join")]
    [AllowAnonymous]
    [EnableRateLimiting("StrictLeadsLimiter")]
    public async Task<IActionResult> SubmitLead([FromBody] LeadProspect lead)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

        // 1. Trampa Honeypot: Detección anti-scrapers y bots (Regla 8)
        if (!string.IsNullOrWhiteSpace(lead.CompanyWebsite) || !string.IsNullOrWhiteSpace(lead.TrapField))
        {
            await _audit.LogAsync("bot", "HONEYPOT_DETECTADO", "prospectos_unete", null, new { lead.FullName, lead.TrapField }, ip);
            return BadRequest(new { message = "Detección de seguridad perimetral activada." });
        }

        // 2. Validación Cloudflare Turnstile Invisible (Regla 8)
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

        lead.FullName = Sanitize(lead.FullName, 150);
        lead.Phone = Sanitize(lead.Phone, 30);
        lead.City = Sanitize(lead.City, 100);
        lead.Email = Sanitize(lead.Email ?? string.Empty, 150);
        lead.Department = Sanitize(lead.Department ?? string.Empty, 100);
        lead.Address = Sanitize(lead.Address ?? string.Empty, 200);
        lead.Experience = Sanitize(lead.Experience ?? string.Empty, 500);
        lead.RoleInterest = Sanitize(lead.RoleInterest, 50).ToLowerInvariant();

        if (!string.IsNullOrWhiteSpace(lead.Email) &&
            !System.Text.RegularExpressions.Regex.IsMatch(
                lead.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            return BadRequest(new { message = "El correo electrónico no es válido." });

        if (lead.FullName.Length < 3 || lead.City.Length < 2)
            return BadRequest(new { message = "Nombre y ciudad no son válidos." });

        if (lead.RoleInterest is not ("consultora" or "directora" or "cliente"))
            return BadRequest(new { message = "Oportunidad de interés no válida." });

        var window = DateTime.UtcNow.AddMinutes(-5);
        var duplicated = await _context.Leads.AsNoTracking().AnyAsync(l =>
            l.Phone == lead.Phone && l.RoleInterest == lead.RoleInterest && l.CreatedAt >= window);
        if (duplicated)
            return Ok(new { success = true, message = "Postulación ya registrada." });

        lead.CreatedAt = DateTime.UtcNow;

        await _context.Leads.AddAsync(lead);
        await _context.SaveChangesAsync();

        await _audit.LogAsync(lead.Email, "POSTULACION_UNETE", "prospectos_unete", lead.Id,
            new { lead.FullName, lead.City, lead.RoleInterest, lead.Phone }, ip);

        return Ok(new { success = true, message = "Postulación registrada exitosamente." });
    }

    private static string Sanitize(string value, int maxLength)
    {
        var clean = new string(value
            .Where(c => !char.IsControl(c))
            .ToArray())
            .Trim();

        return clean.Length <= maxLength ? clean : clean[..maxLength];
    }
}
