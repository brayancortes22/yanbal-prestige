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
    public const string Leader = "Leader";
    public const string Assistant = "Assistant";
    /// <summary>Soporte técnico con control total (cuenta del equipo desarrollador).</summary>
    public const string Developer = "Developer";

    /// <summary>Roles que pueden administrar contenido, catálogo y multimedia.</summary>
    public const string ContentManagers = $"{Director},{Assistant},{Developer}";

    /// <summary>Roles con visión de equipo: administración y liderazgo de zona.</summary>
    public const string TeamManagers = $"{Director},{Leader},{Developer}";

    /// <summary>Control total, incluida la gestión de usuarios y roles.</summary>
    public const string Owners = $"{Director},{Developer}";

    /// <summary>Visión administrativa completa (directora, asistente o soporte).</summary>
    public const string Admins = $"{Director},{Assistant},{Developer}";
}
