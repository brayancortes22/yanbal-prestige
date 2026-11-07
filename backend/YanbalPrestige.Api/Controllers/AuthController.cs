using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.AspNetCore.RateLimiting;
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

    public AuthController(
        IAuthService authService,
        ITurnstileService turnstileService,
        IWebHostEnvironment environment)
    {
        _authService = authService;
        _turnstileService = turnstileService;
        _environment = environment;
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

    [HttpGet("users")]
    [Authorize(Roles = AuthRoles.ContentManagers)]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _authService.GetUsersAsync();
        return Ok(users);
    }

    [HttpPost("users")]
    [Authorize(Roles = AuthRoles.ContentManagers)]
    public async Task<IActionResult> SaveUser([FromBody] UserDto userDto)
    {
        var user = await _authService.SaveUserAsync(userDto);
        return Ok(user);
    }

    [HttpPatch("users/{id}/toggle")]
    [Authorize(Roles = AuthRoles.ContentManagers)]
    public async Task<IActionResult> ToggleUser(string id)
    {
        var success = await _authService.ToggleUserStatusAsync(id);
        if (!success) return NotFound();
        return Ok(new { success = true });
    }

    [HttpDelete("users/{id}")]
    [Authorize(Roles = AuthRoles.ContentManagers)]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var success = await _authService.DeleteUserAsync(id);
        if (!success) return NotFound();
        return Ok(new { success = true });
    }
}
