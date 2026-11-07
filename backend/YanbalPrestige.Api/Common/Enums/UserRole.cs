namespace YanbalPrestige.Api.Common.Enums;

public enum UserRole
{
    Director = 1,
    Consultant = 2,
    Client = 3,
    Leader = 4,
    Assistant = 5,
    /// <summary>
    /// Cuenta de soporte técnico del equipo desarrollador. Tiene control total
    /// para diagnosticar fallos, pero no se crea desde la interfaz: se siembra
    /// desde variables de entorno y no puede desactivarse ni eliminarse.
    /// </summary>
    Developer = 6
}
