using Microsoft.AspNetCore.Mvc;
using YanbalPrestige.Api.Entities;
using YanbalPrestige.Api.Services.Interfaces;

namespace YanbalPrestige.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CmsController : ControllerBase
{
    private readonly ICmsService _cmsService;

    public CmsController(ICmsService cmsService)
    {
        _cmsService = cmsService;
    }

    [HttpGet("slides")]
    public async Task<IActionResult> GetSlides() => Ok(await _cmsService.GetHeroSlidesAsync());

    [HttpPost("slides")]
    public async Task<IActionResult> SaveSlide([FromBody] HeroSlide slide) => Ok(await _cmsService.SaveHeroSlideAsync(slide));

    [HttpDelete("slides/{id}")]
    public async Task<IActionResult> DeleteSlide(string id) => Ok(new { success = await _cmsService.DeleteHeroSlideAsync(id) });

    [HttpGet("catalog")]
    public async Task<IActionResult> GetDigitalCatalog() => Ok(await _cmsService.GetActiveDigitalCatalogAsync());

    [HttpPost("catalog")]
    public async Task<IActionResult> SaveDigitalCatalog([FromBody] DigitalCatalog catalog) => Ok(await _cmsService.SaveDigitalCatalogAsync(catalog));

    [HttpGet("videos")]
    public async Task<IActionResult> GetVideos() => Ok(await _cmsService.GetVideoTipsAsync());

    [HttpPost("videos")]
    public async Task<IActionResult> SaveVideo([FromBody] VideoTip video) => Ok(await _cmsService.SaveVideoTipAsync(video));

    [HttpDelete("videos/{id}")]
    public async Task<IActionResult> DeleteVideo(string id) => Ok(new { success = await _cmsService.DeleteVideoTipAsync(id) });

    [HttpGet("events")]
    public async Task<IActionResult> GetEvents() => Ok(await _cmsService.GetEventsAsync());

    [HttpPost("events")]
    public async Task<IActionResult> SaveEvent([FromBody] EventItem eventItem) => Ok(await _cmsService.SaveEventAsync(eventItem));

    [HttpDelete("events/{id}")]
    public async Task<IActionResult> DeleteEvent(string id) => Ok(new { success = await _cmsService.DeleteEventAsync(id) });
}
