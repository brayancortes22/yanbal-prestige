using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
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

    public AuthController(IAuthService authService, ITurnstileService turnstileService)
    {
        _authService = authService;
        _turnstileService = turnstileService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var result = await _authService.LoginAsync(request);
        if (!result.Success) return Unauthorized(result);
        return Ok(result);
    }

    [HttpPost("request-pin")]
    public async Task<IActionResult> RequestPin([FromBody] RequestPinDto request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var isHuman = await _turnstileService.VerifyTokenAsync(request.TurnstileToken, ip);
        if (!isHuman)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Validación de seguridad anti-bots fallida." });
        }

        var pin = await _authService.GeneratePinAsync(request.Email);
        if (pin == null) return NotFound(new { message = "Usuario no encontrado." });
        return Ok(new { success = true, pin, message = "PIN de recuperación generado exitosamente." });
    }

    [HttpPost("reset-password")]
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
