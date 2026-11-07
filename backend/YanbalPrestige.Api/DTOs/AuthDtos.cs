using System.ComponentModel.DataAnnotations;
using YanbalPrestige.Api.Common.Enums;

namespace YanbalPrestige.Api.DTOs;

public class LoginRequestDto
{
    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(128)]
    public string Password { get; set; } = string.Empty;
}

public class RequestPinDto
{
    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    public string? TurnstileToken { get; set; }
}

public class ResetPasswordWithPinDto
{
    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{6}$", ErrorMessage = "El PIN debe tener 6 dígitos.")]
    public string PinCode { get; set; } = string.Empty;

    [Required]
    [StringLength(128, MinimumLength = 8)]
    public string NewPassword { get; set; } = string.Empty;

    public string? TurnstileToken { get; set; }
}

public class AuthResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public UserDto? User { get; set; }
}

public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string Phone { get; set; } = string.Empty;
    public bool IsActive { get; set; }

    /// <summary>Opcional. Solo se usa al crear o cambiar la contraseña de un usuario.</summary>
    [StringLength(128, MinimumLength = 8)]
    public string? Password { get; set; }
}
