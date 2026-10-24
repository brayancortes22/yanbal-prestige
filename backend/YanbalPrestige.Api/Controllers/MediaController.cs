using Microsoft.AspNetCore.Mvc;
using YanbalPrestige.Api.DTOs;
using YanbalPrestige.Api.Services.Interfaces;

namespace YanbalPrestige.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MediaController : ControllerBase
{
    private readonly IMediaStorageService _mediaService;

    public MediaController(IMediaStorageService mediaService)
    {
        _mediaService = mediaService;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromForm] string subFolder = "general")
    {
        try
        {
            var (url, fileName, size) = await _mediaService.SaveFileAsync(file, subFolder);
            return Ok(new FileUploadResponseDto
            {
                Success = true,
                Message = "Archivo subido correctamente",
                Url = url,
                FileName = fileName,
                SizeBytes = size
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("delete")]
    public IActionResult Delete([FromBody] DeleteFileRequestDto request)
    {
        var deleted = _mediaService.DeleteFile(request.Url);
        return Ok(new { success = deleted, message = deleted ? "Archivo purgado físicamente." : "Archivo no encontrado." });
    }
}
