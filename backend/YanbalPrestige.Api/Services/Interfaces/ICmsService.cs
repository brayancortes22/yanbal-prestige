using YanbalPrestige.Api.Entities;

namespace YanbalPrestige.Api.Services.Interfaces;

public interface ICmsService
{
    Task<List<HeroSlide>> GetHeroSlidesAsync();
    Task<HeroSlide> SaveHeroSlideAsync(HeroSlide slide);
    Task<bool> DeleteHeroSlideAsync(string id);

    Task<DigitalCatalog?> GetActiveDigitalCatalogAsync();
    Task<DigitalCatalog> SaveDigitalCatalogAsync(DigitalCatalog catalog);

    Task<List<VideoTip>> GetVideoTipsAsync();
    Task<VideoTip> SaveVideoTipAsync(VideoTip video);
    Task<bool> DeleteVideoTipAsync(string id);

    Task<List<EventItem>> GetEventsAsync();
    Task<EventItem> SaveEventAsync(EventItem eventItem);
    Task<bool> DeleteEventAsync(string id);
}
