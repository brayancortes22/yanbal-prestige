using YanbalPrestige.Api.DTOs;

namespace YanbalPrestige.Api.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
    Task<string?> GeneratePinAsync(string email);
    Task<bool> ResetPasswordWithPinAsync(ResetPasswordWithPinDto request);
    Task<List<UserDto>> GetUsersAsync();
    Task<UserDto> SaveUserAsync(UserDto userDto);
    Task<bool> ToggleUserStatusAsync(string id);
    Task<bool> DeleteUserAsync(string id);
}
