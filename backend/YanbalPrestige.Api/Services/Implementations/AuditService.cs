using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using YanbalPrestige.Api.Data;
using YanbalPrestige.Api.Entities;
using YanbalPrestige.Api.Services.Interfaces;

namespace YanbalPrestige.Api.Services.Implementations;

public class AuditService : IAuditService
{
    private readonly AppDbContext _db;
    private readonly ILogger<AuditService> _logger;

    public AuditService(AppDbContext db, ILogger<AuditService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task LogAsync(string? actorId, string action, string entity, string? entityId, object? details = null, string? ip = null)
    {
        try
        {
            var audit = new AuditEvent
            {
                ActorId = string.IsNullOrWhiteSpace(actorId) ? "sistema" : actorId,
                Action = action.Trim().ToUpperInvariant(),
                Entity = entity.Trim().ToLowerInvariant(),
                EntityId = entityId,
                Ip = ip,
                DetailsJson = details == null ? null : JsonSerializer.Serialize(details),
                CreatedAt = DateTime.UtcNow,
            };

            _db.AuditEvents.Add(audit);
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            // La auditoría nunca debe romper la transacción principal
            _logger.LogError(ex, "Error al registrar evento de auditoría: {Action} en {Entity}:{EntityId}", action, entity, entityId);
        }
    }

    public async Task<(int total, List<AuditEvent> data)> GetLogsAsync(int page = 1, int pageSize = 50, string? entity = null, string? action = null, string? query = null)
    {
        var q = _db.AuditEvents.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(entity))
            q = q.Where(a => a.Entity == entity.ToLowerInvariant());

        if (!string.IsNullOrWhiteSpace(action))
            q = q.Where(a => a.Action == action.ToUpperInvariant());

        if (!string.IsNullOrWhiteSpace(query))
            q = q.Where(a => (a.ActorId != null && a.ActorId.Contains(query)) ||
                             (a.EntityId != null && a.EntityId.Contains(query)) ||
                             (a.DetailsJson != null && a.DetailsJson.Contains(query)));

        var total = await q.CountAsync();
        var data = await q.OrderByDescending(a => a.CreatedAt)
            .Skip((Math.Max(1, page) - 1) * Math.Clamp(pageSize, 1, 100))
            .Take(Math.Clamp(pageSize, 1, 100))
            .ToListAsync();

        return (total, data);
    }
}
