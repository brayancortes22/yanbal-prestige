namespace YanbalPrestige.Api.Services.Interfaces;

public interface ITurnstileService
{
    Task<bool> VerifyTokenAsync(string? token, string? remoteIp = null);
}
