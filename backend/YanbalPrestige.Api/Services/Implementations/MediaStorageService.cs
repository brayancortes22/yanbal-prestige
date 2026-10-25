using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;
using YanbalPrestige.Api.Services.Interfaces;

namespace YanbalPrestige.Api.Services.Implementations;

public class MediaStorageService : IMediaStorageService
{
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<MediaStorageService> _logger;
    private static readonly HashSet<string> ImageExtensions = [".jpg", ".jpeg", ".png", ".bmp", ".webp"];
    private static readonly HashSet<string> VideoExtensions = [".mp4", ".mov", ".webm"];

    public MediaStorageService(IWebHostEnvironment env, ILogger<MediaStorageService> logger)
    {
        _env = env;
        _logger = logger;
    }

    public async Task<(string url, string fileName, long size)> SaveFileAsync(IFormFile file, string subFolder)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("El archivo es inválido o está vacío.");

        var safeSubFolder = Path.GetFileName(subFolder);
        var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var uploadsRoot = Path.Combine(webRoot, "uploads", safeSubFolder);
        
        if (!Directory.Exists(uploadsRoot))
            Directory.CreateDirectory(uploadsRoot);

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();

        // 1. Compresión y Conversión Automática de Imágenes a WebP
        if (ImageExtensions.Contains(ext))
        {
            var uniqueName = $"{Guid.NewGuid():N}_{DateTime.UtcNow.Ticks}.webp";
            var physicalPath = Path.Combine(uploadsRoot, uniqueName);

            await using var inputStream = file.OpenReadStream();
            using var image = await Image.LoadAsync(inputStream);

            if (image.Width > 1920)
            {
                image.Mutate(x => x.Resize(new ResizeOptions
                {
                    Size = new Size(1920, 0),
                    Mode = ResizeMode.Max
                }));
            }

            await image.SaveAsWebpAsync(physicalPath, new WebpEncoder { Quality = 82 });
            var fileInfo = new FileInfo(physicalPath);

            var publicUrl = $"/uploads/{safeSubFolder}/{uniqueName}";
            _logger.LogInformation("Imagen optimizada a WebP: {Url} ({Size} KB)", publicUrl, fileInfo.Length / 1024);
            return (publicUrl, uniqueName, fileInfo.Length);
        }

        // 2. Control y Guardado de Videos (Streaming Progresivo)
        if (VideoExtensions.Contains(ext))
        {
            if (file.Length > 150 * 1024 * 1024)
                throw new ArgumentException("El video excede el límite máximo permitido de 150 MB.");

            var uniqueName = $"{Guid.NewGuid():N}_{DateTime.UtcNow.Ticks}{ext}";
            var physicalPath = Path.Combine(uploadsRoot, uniqueName);

            await using var stream = new FileStream(physicalPath, FileMode.Create);
            await file.CopyToAsync(stream);

            var publicUrl = $"/uploads/{safeSubFolder}/{uniqueName}";
            _logger.LogInformation("Video guardado para streaming progresivo: {Url}", publicUrl);
            return (publicUrl, uniqueName, file.Length);
        }

        // 3. Documentos y otros archivos (ej. Catálogo PDF)
        var defaultName = $"{Guid.NewGuid():N}_{DateTime.UtcNow.Ticks}{ext}";
        var defaultPath = Path.Combine(uploadsRoot, defaultName);
        await using var defStream = new FileStream(defaultPath, FileMode.Create);
        await file.CopyToAsync(defStream);

        return ($"/uploads/{safeSubFolder}/{defaultName}", defaultName, file.Length);
    }

    public bool DeleteFile(string relativeOrAbsoluteUrl)
    {
        if (string.IsNullOrWhiteSpace(relativeOrAbsoluteUrl)) return false;

        try
        {
            var cleanPath = relativeOrAbsoluteUrl.TrimStart('/');
            if (cleanPath.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            {
                var uri = new Uri(cleanPath);
                cleanPath = uri.AbsolutePath.TrimStart('/');
            }

            // Solo purgar si está dentro del directorio /uploads/
            if (!cleanPath.StartsWith("uploads", StringComparison.OrdinalIgnoreCase))
                return false;

            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var physicalPath = Path.Combine(webRoot, cleanPath.Replace('/', Path.DirectorySeparatorChar));

            if (File.Exists(physicalPath))
            {
                File.Delete(physicalPath);
                _logger.LogInformation("Garbage Collector: Archivo purgado físicamente: {Path}", physicalPath);
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
