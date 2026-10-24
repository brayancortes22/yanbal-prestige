using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using YanbalPrestige.Api.Common.Security;
using YanbalPrestige.Api.Services.Interfaces;

namespace YanbalPrestige.Api.Services.Implementations;

public class TurnstileService : ITurnstileService
{
    private readonly HttpClient _httpClient;
    private readonly TurnstileSettings _settings;
    private readonly ILogger<TurnstileService> _logger;

    public TurnstileService(HttpClient httpClient, IOptions<TurnstileSettings> options, ILogger<TurnstileService> logger)
    {
        _httpClient = httpClient;
        _settings = options.Value;
        _logger = logger;
    }

    public async Task<bool> VerifyTokenAsync(string? token, string? remoteIp = null)
    {
        if (!_settings.Enabled)
        {
            _logger.LogInformation("Turnstile verificación omitida (deshabilitado en configuración).");
            return true;
        }

        if (string.IsNullOrWhiteSpace(token))
        {
            _logger.LogWarning("Token de Turnstile vacío o no enviado.");
            return false;
        }

        try
        {
            var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                { "secret", _settings.SecretKey },
                { "response", token },
                { "remoteip", remoteIp ?? string.Empty }
            });

            var response = await _httpClient.PostAsync("https://challenges.cloudflare.com/turnstile/v0/siteverify", content);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Error al conectar con Cloudflare Turnstile API: {Status}", response.StatusCode);
                return false;
            }

            var result = await response.Content.ReadFromJsonAsync<TurnstileVerifyResponse>();
            if (result != null && result.Success)
            {
                _logger.LogInformation("Turnstile verificación exitosa.");
                return true;
            }

            _logger.LogWarning("Turnstile verificación rechazada: {Errors}", string.Join(",", result?.ErrorCodes ?? []));
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Excepción durante la verificación de Turnstile.");
            return false;
        }
    }

    private class TurnstileVerifyResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("error-codes")]
        public string[]? ErrorCodes { get; set; }
    }
}
