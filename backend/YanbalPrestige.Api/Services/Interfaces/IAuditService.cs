using YanbalPrestige.Api.Entities;

namespace YanbalPrestige.Api.Services.Interfaces;

public interface IAuditService
{
    Task LogAsync(string? actorId, string action, string entity, string? entityId, object? details = null, string? ip = null);
    Task<(int total, List<AuditEvent> data)> GetLogsAsync(int page = 1, int pageSize = 50, string? entity = null, string? action = null, string? query = null);
}
