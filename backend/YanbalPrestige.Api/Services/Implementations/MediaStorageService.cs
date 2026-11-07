using System.Diagnostics;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;
using YanbalPrestige.Api.Services.Interfaces;

namespace YanbalPrestige.Api.Services.Implementations;

public class MediaStorageService : IMediaStorageService
{
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<MediaStorageService> _logger;
    private readonly IConfiguration _configuration;
    private static readonly HashSet<string> ImageExtensions = [".jpg", ".jpeg", ".png", ".bmp", ".webp"];
    private static readonly HashSet<string> VideoExtensions = [".mp4", ".mov", ".webm"];

    public MediaStorageService(
        IWebHostEnvironment env,
        ILogger<MediaStorageService> logger,
        IConfiguration configuration)
    {
        _env = env;
        _logger = logger;
        _configuration = configuration;
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

        // 2. Videos: transcodificación a MP4 H.264 (máx. 1280px), audio AAC
        //    y faststart para reproducción progresiva. Igual que las fotos,
        //    se reduce el peso antes de guardarlo en el VPS.
        if (VideoExtensions.Contains(ext))
        {
            if (file.Length > 150 * 1024 * 1024)
                throw new ArgumentException("El video excede el límite máximo permitido de 150 MB.");

            var uniqueName = $"{Guid.NewGuid():N}_{DateTime.UtcNow.Ticks}.mp4";
            var physicalPath = Path.Combine(uploadsRoot, uniqueName);
            // El archivo de entrada vive en la misma carpeta para evitar
            // problemas de permisos en el directorio temporal del sistema.
            var tempInput = Path.Combine(uploadsRoot, $".tmp-{Guid.NewGuid():N}{ext}");

            try
            {
                await using (var tempStream = new FileStream(tempInput, FileMode.Create))
                {
                    await file.CopyToAsync(tempStream);
                }

                var ffmpeg = _configuration["Media:FfmpegPath"] ?? "ffmpeg";
                var optimized = await TryOptimizeVideoAsync(ffmpeg, tempInput, physicalPath);

                if (!optimized)
                {
                    // Fallback: si ffmpeg no está instalado, guarda el original
                    // para no perder la subida. En el VPS debe instalarse ffmpeg.
                    physicalPath = Path.Combine(uploadsRoot,
                        $"{Guid.NewGuid():N}_{DateTime.UtcNow.Ticks}{ext}");
                    File.Move(tempInput, physicalPath, overwrite: true);
                    uniqueName = Path.GetFileName(physicalPath);
                    _logger.LogWarning(
                        "ffmpeg no disponible o falló; video guardado sin optimizar: {File}",
                        uniqueName);
                }

                var fileInfo = new FileInfo(physicalPath);
                var publicUrl = $"/uploads/{safeSubFolder}/{uniqueName}";
                _logger.LogInformation(
                    "Video optimizado: {Url} ({OriginalKb} KB -> {FinalKb} KB)",
                    publicUrl, file.Length / 1024, fileInfo.Length / 1024);
                return (publicUrl, uniqueName, fileInfo.Length);
            }
            finally
            {
                if (File.Exists(tempInput)) File.Delete(tempInput);
            }
        }

        // 3. Documentos y otros archivos (ej. Catálogo PDF)
        var defaultName = $"{Guid.NewGuid():N}_{DateTime.UtcNow.Ticks}{ext}";
        var defaultPath = Path.Combine(uploadsRoot, defaultName);
        await using var defStream = new FileStream(defaultPath, FileMode.Create);
        await file.CopyToAsync(defStream);

        return ($"/uploads/{safeSubFolder}/{defaultName}", defaultName, file.Length);
    }

    /// <summary>
    /// Transcodifica a H.264/AAC, limita a 1280 px y 30 fps, y mueve el
    /// índice al inicio para reproducción progresiva. Si ffmpeg falla,
    /// devuelve false y el llamador conserva el archivo original.
    /// </summary>
    private async Task<bool> TryOptimizeVideoAsync(string ffmpeg, string input, string output)
    {
        try
        {
            if (File.Exists(output)) File.Delete(output);

            var startInfo = new ProcessStartInfo
            {
                FileName = ffmpeg,
                RedirectStandardError = true,
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            };

            foreach (var arg in new[]
            {
                "-y",
                "-i", input,
                "-vf", "scale='min(1280,iw)':'min(1280,ih)':force_original_aspect_ratio=decrease,fps=30",
                "-c:v", "libx264",
                "-preset", "veryfast",
                "-crf", "25",
                "-pix_fmt", "yuv420p",
                "-c:a", "aac",
                "-b:a", "96k",
                "-movflags", "+faststart",
                "-map_metadata", "-1",
                "-max_muxing_queue_size", "1024",
                output,
            })
            {
                startInfo.ArgumentList.Add(arg);
            }

            using var process = Process.Start(startInfo);
            if (process == null) return false;

            var stderrTask = process.StandardError.ReadToEndAsync();
            using var timeout = new CancellationTokenSource(TimeSpan.FromMinutes(10));
            await process.WaitForExitAsync(timeout.Token);
            var stderr = await stderrTask;

            var success = process.ExitCode == 0 &&
                          File.Exists(output) &&
                          new FileInfo(output).Length > 0;

            if (!success)
            {
                _logger.LogWarning(
                    "ffmpeg terminó con código {Code}: {Error}",
                    process.ExitCode,
                    stderr.Length > 1200 ? stderr[..1200] : stderr);
                if (File.Exists(output)) File.Delete(output);
            }

            return success;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "No se pudo optimizar el video con ffmpeg.");
            if (File.Exists(output)) File.Delete(output);
            return false;
        }
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
