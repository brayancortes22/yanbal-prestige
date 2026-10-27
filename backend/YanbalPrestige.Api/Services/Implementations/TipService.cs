using Microsoft.EntityFrameworkCore;
using YanbalPrestige.Api.Data;
using YanbalPrestige.Api.Entities;
using YanbalPrestige.Api.Services.Interfaces;

namespace YanbalPrestige.Api.Services.Implementations;

public class TipService : ITipService
{
    private readonly AppDbContext _context;
    private readonly IMediaStorageService _mediaService;

    public TipService(AppDbContext context, IMediaStorageService mediaService)
    {
        _context = context;
        _mediaService = mediaService;
    }

    public async Task<List<Tip>> GetActiveTipsAsync()
    {
        return await _context.Tips.AsNoTracking()
            .Where(t => t.IsActive)
            .OrderBy(t => t.Order)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Tip>> GetAllTipsAsync()
    {
        return await _context.Tips.AsNoTracking()
            .OrderBy(t => t.Order)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<Tip?> GetTipByIdAsync(string id)
    {
        return await _context.Tips.AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<Tip> SaveTipAsync(Tip tip)
    {
        if (string.IsNullOrWhiteSpace(tip.Id))
        {
            tip.Id = Guid.NewGuid().ToString();
        }

        tip.UpdatedAt = DateTime.UtcNow;

        var existing = await _context.Tips.FindAsync(tip.Id);
        if (existing == null)
        {
            if (tip.CreatedAt == default)
            {
                tip.CreatedAt = DateTime.UtcNow;
            }

            await _context.Tips.AddAsync(tip);
        }
        else
        {
            if (!string.IsNullOrWhiteSpace(existing.Image) && existing.Image != tip.Image)
            {
                _mediaService.DeleteFile(existing.Image);
            }

            if (!string.IsNullOrWhiteSpace(existing.VideoUrl) && existing.VideoUrl != tip.VideoUrl)
            {
                _mediaService.DeleteFile(existing.VideoUrl);
            }

            _context.Entry(existing).CurrentValues.SetValues(tip);
        }

        await _context.SaveChangesAsync();
        return tip;
    }

    public async Task<bool> DeleteTipAsync(string id)
    {
        var tip = await _context.Tips.FindAsync(id);
        if (tip == null) return false;

        _mediaService.DeleteFile(tip.Image);
        if (!string.IsNullOrWhiteSpace(tip.VideoUrl))
        {
            _mediaService.DeleteFile(tip.VideoUrl);
        }

        _context.Tips.Remove(tip);
        await _context.SaveChangesAsync();
        return true;
    }
}
