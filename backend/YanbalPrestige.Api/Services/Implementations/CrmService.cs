using Microsoft.EntityFrameworkCore;
using YanbalPrestige.Api.Data;
using YanbalPrestige.Api.Entities;
using YanbalPrestige.Api.Services.Interfaces;

namespace YanbalPrestige.Api.Services.Implementations;

public class CrmService : ICrmService
{
    private readonly AppDbContext _context;

    public CrmService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ConsultantClient>> GetClientsByConsultantAsync(string consultantId)
    {
        return await _context.ConsultantClients.AsNoTracking()
            .Where(c => c.ConsultantId == consultantId)
            .OrderByDescending(c => c.LastContactDate)
            .ToListAsync();
    }

    public async Task<ConsultantClient> SaveClientAsync(ConsultantClient client)
    {
        if (string.IsNullOrWhiteSpace(client.Id))
        {
            client.Id = Guid.NewGuid().ToString();
            client.CreatedAt = DateTime.UtcNow;
            await _context.ConsultantClients.AddAsync(client);
        }
        else
        {
            var existing = await _context.ConsultantClients.FindAsync(client.Id);
            if (existing == null)
            {
                client.CreatedAt = DateTime.UtcNow;
                await _context.ConsultantClients.AddAsync(client);
            }
            else
            {
                _context.Entry(existing).CurrentValues.SetValues(client);
            }
        }

        await _context.SaveChangesAsync();
        return client;
    }

    public async Task<bool> DeleteClientAsync(string id, string consultantId)
    {
        var client = await _context.ConsultantClients
            .FirstOrDefaultAsync(c => c.Id == id && c.ConsultantId == consultantId);

        if (client == null) return false;

        _context.ConsultantClients.Remove(client);
        await _context.SaveChangesAsync();
        return true;
    }
}
