using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;
using YanbalPrestige.Api.Common.Enums;
using YanbalPrestige.Api.Common.Security;
using YanbalPrestige.Api.DTOs;
using YanbalPrestige.Api.Services.Interfaces;

namespace YanbalPrestige.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[OutputCache(NoStore = true, Duration = 0)]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ITurnstileService _turnstileService;
    private readonly IWebHostEnvironment _environment;
    private readonly IAuditService _audit;

    public AuthController(
        IAuthService authService,
        ITurnstileService turnstileService,
        IWebHostEnvironment environment,
        IAuditService audit)
    {
        _authService = authService;
        _turnstileService = turnstileService;
        _environment = environment;
        _audit = audit;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("AuthLimiter")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var result = await _authService.LoginAsync(request);
        if (!result.Success) return Unauthorized(result);
        return Ok(result);
    }

    [HttpPost("request-pin")]
    [AllowAnonymous]
    [EnableRateLimiting("AuthLimiter")]
    public async Task<IActionResult> RequestPin([FromBody] RequestPinDto request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var isHuman = await _turnstileService.VerifyTokenAsync(request.TurnstileToken, ip);
        if (!isHuman)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Validación de seguridad anti-bots fallida." });
        }

        var pin = await _authService.GeneratePinAsync(request.Email);

        // Respuesta neutra: no confirma si el correo existe (anti-enumeración).
        // El PIN solo se devuelve en Development para poder probar sin SMTP.
        return Ok(new
        {
            success = true,
            message = "Si el correo está registrado, recibirás un PIN de recuperación.",
            pin = _environment.IsDevelopment() ? pin : null
        });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    [EnableRateLimiting("AuthLimiter")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordWithPinDto request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var isHuman = await _turnstileService.VerifyTokenAsync(request.TurnstileToken, ip);
        if (!isHuman)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Validación de seguridad anti-bots fallida." });
        }

        var success = await _authService.ResetPasswordWithPinAsync(request);
        if (!success) return BadRequest(new { message = "PIN inválido o expirado." });
        return Ok(new { success = true, message = "Contraseña restablecida con éxito." });
    }

    /// <summary>Perfil del usuario autenticado (cualquier rol).</summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var users = await _authService.GetUsersAsync();
        var current = users.FirstOrDefault(u => u.Id == userId);
        if (current == null) return NotFound(new { message = "Usuario no encontrado." });
        return Ok(current);
    }

    [HttpGet("users")]
    [Authorize]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _authService.GetUsersAsync();
        if (User.IsInRole(AuthRoles.Director)) return Ok(users);

        var currentId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Un líder ve su perfil y su equipo; los demás solo su propio perfil.
        if (User.IsInRole(AuthRoles.Leader))
            return Ok(users.Where(u => u.Id == currentId || u.LeaderId == currentId));

        return Ok(users.Where(u => u.Id == currentId));
    }

    [HttpPost("users")]
    [Authorize(Roles = AuthRoles.Owners)]
    public async Task<IActionResult> SaveUser([FromBody] UserDto userDto)
    {
        var users = await _authService.GetUsersAsync();
        var existing = users.FirstOrDefault(u => u.Id == userDto.Id);
        var currentId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userDto.Role == UserRole.Developer)
        {
            return BadRequest(new
            {
                message = "La cuenta de soporte técnico solo se crea desde variables de entorno."
            });
        }

        if (existing != null)
        {
            if (existing.Role == UserRole.Developer)
            {
                return BadRequest(new
                {
                    message = "La cuenta de soporte técnico se administra desde variables de entorno y no puede editarse aquí."
                });
            }

            if (existing.Id == currentId &&
                existing.Role == UserRole.Director &&
                userDto.Role != UserRole.Director)
            {
                return BadRequest(new
                {
                    message = "No puedes quitarte a ti misma el rol de administradora."
                });
            }

            var activeDirectors = users.Count(u => u.Role == UserRole.Director && u.IsActive);
            var removesActiveDirector = existing.Role == UserRole.Director &&
                                        existing.IsActive &&
                                        (userDto.Role != UserRole.Director || !userDto.IsActive);

            if (removesActiveDirector && activeDirectors <= 1)
            {
                return BadRequest(new
                {
                    message = "Debe quedar al menos una administradora activa en la red."
                });
            }
        }

        var isNew = existing == null;
        var user = await _authService.SaveUserAsync(userDto);
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        await _audit.LogAsync(currentId, isNew ? "CREAR_USUARIO" : "MODIFICAR_USUARIO", "usuarios", user.Id, new { user.Email, user.FullName, Role = user.Role.ToString() }, ip);
        return Ok(user);
    }

    [HttpPatch("users/{id}/toggle")]
    [Authorize(Roles = AuthRoles.Owners)]
    public async Task<IActionResult> ToggleUser(string id)
    {
        var currentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (id == currentId)
            return BadRequest(new { message = "No puedes desactivar tu propia cuenta." });

        var users = await _authService.GetUsersAsync();
        var target = users.FirstOrDefault(u => u.Id == id);
        if (target == null) return NotFound();

        if (target.Role == UserRole.Developer)
        {
            return BadRequest(new
            {
                message = "La cuenta de soporte técnico no puede desactivarse."
            });
        }

        var activeDirectors = users.Count(u => u.Role == UserRole.Director && u.IsActive);
        if (target.Role == UserRole.Director && target.IsActive && activeDirectors <= 1)
        {
            return BadRequest(new
            {
                message = "Debe quedar al menos una administradora activa en la red."
            });
        }

        var success = await _authService.ToggleUserStatusAsync(id);
        if (!success) return NotFound();
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        await _audit.LogAsync(currentId, "TOGGLE_ESTADO_USUARIO", "usuarios", id, new { target.Email, target.FullName }, ip);
        return Ok(new { success = true });
    }

    [HttpDelete("users/{id}")]
    [Authorize(Roles = AuthRoles.Owners)]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var currentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (id == currentId)
            return BadRequest(new { message = "No puedes eliminar tu propia cuenta." });

        var users = await _authService.GetUsersAsync();
        var target = users.FirstOrDefault(u => u.Id == id);
        if (target == null) return NotFound();

        if (target.Role == UserRole.Developer)
        {
            return BadRequest(new
            {
                message = "La cuenta de soporte técnico no puede eliminarse."
            });
        }

        var activeDirectors = users.Count(u => u.Role == UserRole.Director && u.IsActive);
        if (target.Role == UserRole.Director && target.IsActive && activeDirectors <= 1)
        {
            return BadRequest(new
            {
                message = "Debe quedar al menos una administradora activa en la red."
            });
        }

        var success = await _authService.DeleteUserAsync(id);
        if (!success) return NotFound();
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        await _audit.LogAsync(currentId, "ELIMINAR_USUARIO", "usuarios", id, new { target.Email, target.FullName }, ip);
        return Ok(new { success = true });
    }
}
