using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using YanbalPrestige.Api.Common.Enums;
using YanbalPrestige.Api.Common.Security;
using YanbalPrestige.Api.Data;
using YanbalPrestige.Api.DTOs;
using YanbalPrestige.Api.Entities;
using YanbalPrestige.Api.Services.Interfaces;

namespace YanbalPrestige.Api.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;

    public AuthService(AppDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _context.Users.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower() && u.IsActive);

        // Respuesta genérica: no revela si el correo existe.
        if (user == null || !PasswordHasher.Verify(request.Password, user.PasswordHash))
        {
            return new AuthResponseDto { Success = false, Message = "Credenciales incorrectas o usuario inactivo." };
        }

        // Token JWT firmado con HMAC-SHA256 (clave en JWT_KEY, nunca en el repo)
        var (token, _) = _tokenService.CreateToken(user);

        return new AuthResponseDto
        {
            Success = true,
            Message = "Autenticación exitosa",
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Phone = user.Phone,
                IsActive = user.IsActive,
                DocumentId = user.DocumentId,
                Zone = user.Zone,
                LeaderId = user.LeaderId
            }
        };
    }

    public async Task<string?> GeneratePinAsync(string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower() && u.IsActive);
        if (user == null) return null;

        // PIN criptográfico de 6 dígitos y anulación de PINs anteriores.
        var pin = RandomNumberGenerator.GetInt32(100_000, 1_000_000).ToString();

        var previousPins = await _context.PasswordResetPins
            .Where(p => p.UserId == user.Id && !p.IsUsed)
            .ToListAsync();
        previousPins.ForEach(p => p.IsUsed = true);

        var resetRecord = new PasswordResetPin
        {
            UserId = user.Id,
            // El PIN nunca se guarda en claro: si filtran la tabla,
            // el atacante no puede reutilizarlo para tomar la cuenta.
            PinCode = PasswordHasher.Hash(pin),
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            IsUsed = false,
            CreatedAt = DateTime.UtcNow
        };

        await _context.PasswordResetPins.AddAsync(resetRecord);
        await _context.SaveChangesAsync();
        return pin;
    }

    public async Task<bool> ResetPasswordWithPinAsync(ResetPasswordWithPinDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (user == null) return false;

        // Los PIN se guardan hasheados: se traen los candidatos vigentes
        // (máximo 5) y se verifica el hash en memoria.
        var candidates = await _context.PasswordResetPins
            .Where(p => p.UserId == user.Id && !p.IsUsed && p.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(p => p.CreatedAt)
            .Take(5)
            .ToListAsync();

        var pinRecord = candidates.FirstOrDefault(p => PasswordHasher.Verify(request.PinCode, p.PinCode));
        if (pinRecord == null) return false;

        if (!IsStrongEnough(request.NewPassword)) return false;

        pinRecord.IsUsed = true;
        user.PasswordHash = PasswordHasher.Hash(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        // Invalida cualquier otro PIN pendiente del mismo usuario.
        var otherPins = await _context.PasswordResetPins
            .Where(p => p.UserId == user.Id && !p.IsUsed)
            .ToListAsync();
        otherPins.ForEach(p => p.IsUsed = true);

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<UserDto>> GetUsersAsync()
    {
        return await _context.Users.AsNoTracking()
            .Select(u => new UserDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Role = u.Role,
                Phone = u.Phone,
                IsActive = u.IsActive,
                DocumentId = u.DocumentId,
                Zone = u.Zone,
                LeaderId = u.LeaderId
            })
            .ToListAsync();
    }

    public async Task<UserDto> SaveUserAsync(UserDto dto)
    {
        // Solo se acepta un líder real y activo; cualquier otra referencia
        // se descarta para no dejar consultoras huérfanas o mal asignadas.
        if (!string.IsNullOrWhiteSpace(dto.LeaderId))
        {
            var leader = await _context.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == dto.LeaderId && u.Role == UserRole.Leader && u.IsActive);
            if (leader == null) dto.LeaderId = null;
        }

        var user = await _context.Users.FindAsync(dto.Id);
        if (user == null)
        {
            user = new User
            {
                Id = string.IsNullOrWhiteSpace(dto.Id) ? Guid.NewGuid().ToString() : dto.Id,
                FullName = dto.FullName,
                Email = dto.Email,
                Role = dto.Role,
                Phone = dto.Phone,
                DocumentId = dto.DocumentId,
                Zone = dto.Zone,
                IsActive = dto.IsActive,
                LeaderId = dto.Role == UserRole.Consultant ? dto.LeaderId : null,
                // Sin contraseña explícita la cuenta nace bloqueada:
                // solo se activa con el flujo de recuperación por PIN.
                PasswordHash = PasswordHasher.Hash(
                    string.IsNullOrWhiteSpace(dto.Password)
                        ? Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
                        : dto.Password)
            };
            await _context.Users.AddAsync(user);
        }
        else
        {
            user.FullName = dto.FullName;
            user.Email = dto.Email;
            user.Role = dto.Role;
            user.Phone = dto.Phone;
            user.DocumentId = dto.DocumentId;
            user.Zone = dto.Zone;
            user.IsActive = dto.IsActive;
            user.LeaderId = dto.Role == UserRole.Consultant ? dto.LeaderId : null;
            user.UpdatedAt = DateTime.UtcNow;

            if (!string.IsNullOrWhiteSpace(dto.Password))
                user.PasswordHash = PasswordHasher.Hash(dto.Password);
        }

        await _context.SaveChangesAsync();
        dto.Id = user.Id;
        return dto;
    }

    public async Task<bool> ToggleUserStatusAsync(string id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;
        user.IsActive = !user.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteUserAsync(string id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>Mínimo 8 caracteres con al menos una letra y un número.</summary>
    private static bool IsStrongEnough(string password) =>
        password.Length >= 8 &&
        password.Any(char.IsLetter) &&
        password.Any(char.IsDigit);
}
