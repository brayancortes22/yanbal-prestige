using Microsoft.EntityFrameworkCore;
using YanbalPrestige.Api.Data;
using YanbalPrestige.Api.Entities;
using YanbalPrestige.Api.Services.Interfaces;

namespace YanbalPrestige.Api.Services.Implementations;

public class CmsService : ICmsService
{
    private readonly AppDbContext _context;
    private readonly IMediaStorageService _mediaService;

    public CmsService(AppDbContext context, IMediaStorageService mediaService)
    {
        _context = context;
        _mediaService = mediaService;
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
        {
            await _context.HeroSlides.AddAsync(slide);
        }
        else
        {
            if (!string.IsNullOrWhiteSpace(existing.ImageUrl) && existing.ImageUrl != slide.ImageUrl)
                _mediaService.DeleteFile(existing.ImageUrl);

            _context.Entry(existing).CurrentValues.SetValues(slide);
        }

        await _context.SaveChangesAsync();
        return slide;
    }

    public async Task<bool> DeleteHeroSlideAsync(string id)
    {
        var slide = await _context.HeroSlides.FindAsync(id);
        if (slide == null) return false;

        _mediaService.DeleteFile(slide.ImageUrl);
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
        {
            await _context.DigitalCatalogs.AddAsync(catalog);
        }
        else
        {
            if (!string.IsNullOrWhiteSpace(existing.CoverImageUrl) && existing.CoverImageUrl != catalog.CoverImageUrl)
                _mediaService.DeleteFile(existing.CoverImageUrl);

            _context.Entry(existing).CurrentValues.SetValues(catalog);
        }

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
        {
            await _context.VideoTips.AddAsync(video);
        }
        else
        {
            if (!string.IsNullOrWhiteSpace(existing.ThumbnailUrl) && existing.ThumbnailUrl != video.ThumbnailUrl)
                _mediaService.DeleteFile(existing.ThumbnailUrl);
            if (!string.IsNullOrWhiteSpace(existing.VideoUrl) && existing.VideoUrl != video.VideoUrl)
                _mediaService.DeleteFile(existing.VideoUrl);

            _context.Entry(existing).CurrentValues.SetValues(video);
        }

        await _context.SaveChangesAsync();
        return video;
    }

    public async Task<bool> DeleteVideoTipAsync(string id)
    {
        var video = await _context.VideoTips.FindAsync(id);
        if (video == null) return false;

        _mediaService.DeleteFile(video.ThumbnailUrl);
        _mediaService.DeleteFile(video.VideoUrl);

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
        {
            await _context.Events.AddAsync(eventItem);
        }
        else
        {
            if (!string.IsNullOrWhiteSpace(existing.Image) && existing.Image != eventItem.Image)
                _mediaService.DeleteFile(existing.Image);

            _context.Entry(existing).CurrentValues.SetValues(eventItem);
        }

        await _context.SaveChangesAsync();
        return eventItem;
    }

    public async Task<bool> DeleteEventAsync(string id)
    {
        var evt = await _context.Events.FindAsync(id);
        if (evt == null) return false;

        _mediaService.DeleteFile(evt.Image);
        _context.Events.Remove(evt);
        await _context.SaveChangesAsync();
        return true;
    }
}
