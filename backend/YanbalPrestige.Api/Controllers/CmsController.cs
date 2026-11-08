using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using YanbalPrestige.Api.Common.Security;
using YanbalPrestige.Api.Entities;
using YanbalPrestige.Api.Services.Interfaces;

namespace YanbalPrestige.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CmsController : ControllerBase
{
    private readonly ICmsService _cmsService;
    private readonly IAuditService _audit;

    public CmsController(ICmsService cmsService, IAuditService audit)
    {
        _cmsService = cmsService;
        _audit = audit;
    }

    [HttpGet("slides")]
    [AllowAnonymous]
    [OutputCache(PolicyName = "PublicCatalog")]
    public async Task<IActionResult> GetSlides() => Ok(await _cmsService.GetHeroSlidesAsync());

    [HttpPost("slides")]
    [Authorize(Roles = AuthRoles.ContentManagers)]
    public async Task<IActionResult> SaveSlide([FromBody] HeroSlide slide) => Ok(await _cmsService.SaveHeroSlideAsync(slide));

    [HttpDelete("slides/{id}")]
    [Authorize(Roles = AuthRoles.ContentManagers)]
    public async Task<IActionResult> DeleteSlide(string id)
    {
        var s = await _cmsService.DeleteHeroSlideAsync(id);
        var actor = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        await _audit.LogAsync(actor, "ELIMINAR_SLIDE", "cms_slides", id, null, ip);
        return Ok(new { success = s });
    }

    [HttpGet("catalog")]
    [AllowAnonymous]
    public async Task<IActionResult> GetDigitalCatalog() => Ok(await _cmsService.GetActiveDigitalCatalogAsync());

    [HttpPost("catalog")]
    [Authorize(Roles = AuthRoles.ContentManagers)]
    public async Task<IActionResult> SaveDigitalCatalog([FromBody] DigitalCatalog catalog) => Ok(await _cmsService.SaveDigitalCatalogAsync(catalog));

    [HttpGet("videos")]
    [AllowAnonymous]
    public async Task<IActionResult> GetVideos() => Ok(await _cmsService.GetVideoTipsAsync());

    [HttpPost("videos")]
    [Authorize(Roles = AuthRoles.ContentManagers)]
    public async Task<IActionResult> SaveVideo([FromBody] VideoTip video)
    {
        var r = await _cmsService.SaveVideoTipAsync(video);
        var actor = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        await _audit.LogAsync(actor, "GUARDAR_VIDEO", "cms_videos", r.Id, new { r.Title, r.Category }, ip);
        return Ok(r);
    }

    [HttpDelete("videos/{id}")]
    [Authorize(Roles = AuthRoles.ContentManagers)]
    public async Task<IActionResult> DeleteVideo(string id)
    {
        var s = await _cmsService.DeleteVideoTipAsync(id);
        var actor = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        await _audit.LogAsync(actor, "ELIMINAR_VIDEO", "cms_videos", id, null, ip);
        return Ok(new { success = s });
    }

    [HttpGet("events")]
    [AllowAnonymous]
    [OutputCache(PolicyName = "PublicCatalog")]
    public async Task<IActionResult> GetEvents() => Ok(await _cmsService.GetEventsAsync());

    [HttpPost("events")]
    [Authorize(Roles = AuthRoles.ContentManagers)]
    public async Task<IActionResult> SaveEvent([FromBody] EventItem eventItem)
    {
        var r = await _cmsService.SaveEventAsync(eventItem);
        var actor = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        await _audit.LogAsync(actor, "GUARDAR_EVENTO", "eventos", r.Id, new { r.Title, r.Location, r.Date }, ip);
        return Ok(r);
    }

    [HttpDelete("events/{id}")]
    [Authorize(Roles = AuthRoles.ContentManagers)]
    public async Task<IActionResult> DeleteEvent(string id)
    {
        var s = await _cmsService.DeleteEventAsync(id);
        var actor = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        await _audit.LogAsync(actor, "ELIMINAR_EVENTO", "eventos", id, null, ip);
        return Ok(new { success = s });
    }
}
