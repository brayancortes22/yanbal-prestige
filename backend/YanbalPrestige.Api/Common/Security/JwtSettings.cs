namespace YanbalPrestige.Api.Common.Security;

/// <summary>
/// Configuración de firma de tokens JWT.
/// La clave NUNCA se guarda en appsettings: se inyecta con la variable
/// de entorno JWT_KEY o con user-secrets en desarrollo.
/// </summary>
public class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "YanbalPrestige.Api";
    public string Audience { get; set; } = "YanbalPrestige.Web";
    public string Key { get; set; } = string.Empty;
    public int ExpirationHours { get; set; } = 8;
}

/// <summary>Roles expuestos en el claim de rol del token.</summary>
public static class AuthRoles
{
    public const string Director = "Director";
    public const string Consultant = "Consultant";
    public const string Client = "Client";

    /// <summary>Roles que pueden administrar contenido, catálogo y multimedia.</summary>
    public const string ContentManagers = $"{Director}";
}
