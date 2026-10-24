using YanbalPrestige.Api.Services.Interfaces;

namespace YanbalPrestige.Api.Services.Implementations;

public class MediaStorageService : IMediaStorageService
{
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<MediaStorageService> _logger;

    public MediaStorageService(IWebHostEnvironment env, ILogger<MediaStorageService> logger)
    {
        _env = env;
        _logger = logger;
    }

    public async Task<(string url, string fileName, long size)> SaveFileAsync(IFormFile file, string subFolder)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("El archivo es inválido o está vacío.");
        }

        // Sanitización contra Directory Traversal
        var safeSubFolder = Path.GetFileName(subFolder);
        var uploadsRoot = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", safeSubFolder);
        
        if (!Directory.Exists(uploadsRoot))
        {
            Directory.CreateDirectory(uploadsRoot);
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var uniqueFileName = $"{Guid.NewGuid():N}_{DateTime.UtcNow.Ticks}{extension}";
        var physicalPath = Path.Combine(uploadsRoot, uniqueFileName);

        await using var stream = new FileStream(physicalPath, FileMode.Create);
        await file.CopyToAsync(stream);

        var publicUrl = $"/uploads/{safeSubFolder}/{uniqueFileName}";
        _logger.LogInformation("Archivo guardado exitosamente en: {Path}", physicalPath);

        return (publicUrl, uniqueFileName, file.Length);
    }

    public bool DeleteFile(string relativeOrAbsoluteUrl)
    {
        if (string.IsNullOrWhiteSpace(relativeOrAbsoluteUrl)) return false;

        try
        {
            // Limpieza para extraer ruta relativa desde /uploads/...
            var cleanPath = relativeOrAbsoluteUrl.TrimStart('/');
            if (cleanPath.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            {
                var uri = new Uri(cleanPath);
                cleanPath = uri.AbsolutePath.TrimStart('/');
            }

            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var physicalPath = Path.Combine(webRoot, cleanPath.Replace('/', Path.DirectorySeparatorChar));

            if (File.Exists(physicalPath))
            {
                File.Delete(physicalPath);
                _logger.LogInformation("Garbage Collector: Archivo físico purgado: {Path}", physicalPath);
                return true;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al purgar archivo del disco: {Url}", relativeOrAbsoluteUrl);
        }

        return false;
    }
}
