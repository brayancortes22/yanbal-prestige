using Microsoft.EntityFrameworkCore;
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

        if (user == null)
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
                IsActive = user.IsActive
            }
        };
    }

    public async Task<string?> GeneratePinAsync(string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower() && u.IsActive);
        if (user == null) return null;

        // Generar PIN aleatorio de 6 dígitos
        var random = new Random();
        var pin = random.Next(100000, 999999).ToString();

        var resetRecord = new PasswordResetPin
        {
            UserId = user.Id,
            PinCode = pin,
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

        var pinRecord = await _context.PasswordResetPins
            .Where(p => p.UserId == user.Id && p.PinCode == request.PinCode && !p.IsUsed && p.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync();

        if (pinRecord == null) return false;

        pinRecord.IsUsed = true;
        user.PasswordHash = $"hash_{request.NewPassword.GetHashCode()}";
        user.UpdatedAt = DateTime.UtcNow;

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
                IsActive = u.IsActive
            })
            .ToListAsync();
    }

    public async Task<UserDto> SaveUserAsync(UserDto dto)
    {
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
                IsActive = dto.IsActive,
                PasswordHash = "default_pass_hash_123"
            };
            await _context.Users.AddAsync(user);
        }
        else
        {
            user.FullName = dto.FullName;
            user.Email = dto.Email;
            user.Role = dto.Role;
            user.Phone = dto.Phone;
            user.IsActive = dto.IsActive;
            user.UpdatedAt = DateTime.UtcNow;
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
}
