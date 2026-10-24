using Microsoft.EntityFrameworkCore;
using YanbalPrestige.Api.Data;
using YanbalPrestige.Api.Entities;
using YanbalPrestige.Api.Services.Interfaces;

namespace YanbalPrestige.Api.Services.Implementations;

public class CmsService : ICmsService
{
    private readonly AppDbContext _context;

    public CmsService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<HeroSlide>> GetHeroSlidesAsync()
    {
        return await _context.HeroSlides.AsNoTracking()
            .OrderBy(s => s.Order)
            .ToListAsync();
    }

    public async Task<HeroSlide> SaveHeroSlideAsync(HeroSlide slide)
    {
        var existing = await _context.HeroSlides.FindAsync(slide.Id);
        if (existing == null)
            await _context.HeroSlides.AddAsync(slide);
        else
            _context.Entry(existing).CurrentValues.SetValues(slide);

        await _context.SaveChangesAsync();
        return slide;
    }

    public async Task<bool> DeleteHeroSlideAsync(string id)
    {
        var slide = await _context.HeroSlides.FindAsync(id);
        if (slide == null) return false;
        _context.HeroSlides.Remove(slide);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<DigitalCatalog?> GetActiveDigitalCatalogAsync()
    {
        return await _context.DigitalCatalogs.AsNoTracking()
            .FirstOrDefaultAsync(c => c.IsActive);
    }

    public async Task<DigitalCatalog> SaveDigitalCatalogAsync(DigitalCatalog catalog)
    {
        var existing = await _context.DigitalCatalogs.FindAsync(catalog.Id);
        if (existing == null)
            await _context.DigitalCatalogs.AddAsync(catalog);
        else
            _context.Entry(existing).CurrentValues.SetValues(catalog);

        await _context.SaveChangesAsync();
        return catalog;
    }

    public async Task<List<VideoTip>> GetVideoTipsAsync()
    {
        return await _context.VideoTips.AsNoTracking()
            .OrderBy(v => v.Order)
            .ToListAsync();
    }

    public async Task<VideoTip> SaveVideoTipAsync(VideoTip video)
    {
        var existing = await _context.VideoTips.FindAsync(video.Id);
        if (existing == null)
            await _context.VideoTips.AddAsync(video);
        else
            _context.Entry(existing).CurrentValues.SetValues(video);

        await _context.SaveChangesAsync();
        return video;
    }

    public async Task<bool> DeleteVideoTipAsync(string id)
    {
        var video = await _context.VideoTips.FindAsync(id);
        if (video == null) return false;
        _context.VideoTips.Remove(video);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<EventItem>> GetEventsAsync()
    {
        return await _context.Events.AsNoTracking()
            .Where(e => e.IsActive)
            .ToListAsync();
    }

    public async Task<EventItem> SaveEventAsync(EventItem eventItem)
    {
        var existing = await _context.Events.FindAsync(eventItem.Id);
        if (existing == null)
            await _context.Events.AddAsync(eventItem);
        else
            _context.Entry(existing).CurrentValues.SetValues(eventItem);

        await _context.SaveChangesAsync();
        return eventItem;
    }

    public async Task<bool> DeleteEventAsync(string id)
    {
        var evt = await _context.Events.FindAsync(id);
        if (evt == null) return false;
        _context.Events.Remove(evt);
        await _context.SaveChangesAsync();
        return true;
    }
}
