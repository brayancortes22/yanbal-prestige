namespace YanbalPrestige.Api.Common.Security;

public class TurnstileSettings
{
    public const string SectionName = "CloudflareTurnstile";

    public bool Enabled { get; set; } = true;
    public string SiteKey { get; set; } = "1x00000000000000000000AA"; // Cloudflare dummy test key (Always passes)
    public string SecretKey { get; set; } = "1x0000000000000000000000000000000AA"; // Cloudflare dummy secret (Always passes)
}
