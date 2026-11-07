using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using YanbalPrestige.Api.Data;
using YanbalPrestige.Api.Entities;

namespace YanbalPrestige.Api.Services.Background;

/// <summary>
/// Limpia archivos huérfanos de la galería de productos en el VPS.
///
/// Un archivo queda huérfano cuando el usuario sube una foto o un video y
/// luego cancela el formulario, o cuando el proceso se cae antes de guardar.
/// Para no borrar una subida que aún está en curso, solo se eliminan archivos
/// con más de <c>Media:OrphanGraceHours</c> horas (24 por defecto) que no
/// estén referenciados por ningún producto en MySQL.
/// </summary>
public class MediaCleanupWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _configuration;
    private readonly ILogger<MediaCleanupWorker> _logger;

    public MediaCleanupWorker(
        IServiceScopeFactory scopeFactory,
        IWebHostEnvironment env,
        IConfiguration configuration,
        ILogger<MediaCleanupWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _env = env;
        _configuration = configuration;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Espera inicial para no competir con el arranque de la API.
        try
        {
            await Task.Delay(TimeSpan.FromMinutes(2), stoppingToken);
        }
        catch (OperationCanceledException)
        {
            return;
        }

        using var timer = new PeriodicTimer(TimeSpan.FromHours(6));

        do
        {
            try
            {
                await CleanupAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "No se pudo ejecutar la limpieza de medios huérfanos.");
            }
        }
        while (await SafeWaitAsync(timer, stoppingToken));
    }

    private static async Task<bool> SafeWaitAsync(PeriodicTimer timer, CancellationToken token)
    {
        try
        {
            return await timer.WaitForNextTickAsync(token);
        }
        catch (OperationCanceledException)
        {
            return false;
        }
    }

    private async Task CleanupAsync(CancellationToken token)
    {
        var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var productsRoot = Path.Combine(webRoot, "uploads", "products");
        if (!Directory.Exists(productsRoot)) return;

        var graceHours = _configuration.GetValue("Media:OrphanGraceHours", 24);
        var cutoff = DateTime.UtcNow.AddHours(-Math.Max(1, graceHours));

        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var products = await db.Products.AsNoTracking()
            .Select(p => new { p.Image, p.MediaJson })
            .ToListAsync(token);

        var referenced = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var product in products)
        {
            AddReference(referenced, product.Image);

            if (string.IsNullOrWhiteSpace(product.MediaJson)) continue;

            try
            {
                var media = JsonSerializer.Deserialize<List<ProductMedia>>(product.MediaJson);
                foreach (var item in media ?? new List<ProductMedia>())
                    AddReference(referenced, item.Url);
            }
            catch (JsonException)
            {
                // Un JSON corrupto no debe impedir la limpieza del resto.
            }
        }

        var deleted = 0;
        foreach (var file in Directory.EnumerateFiles(productsRoot, "*", SearchOption.AllDirectories))
        {
            token.ThrowIfCancellationRequested();

            // No tocar archivos temporales de una subida en curso.
            if (Path.GetFileName(file).StartsWith(".tmp-", StringComparison.Ordinal))
                continue;

            if (File.GetLastWriteTimeUtc(file) > cutoff) continue;

            var relative = Path.GetRelativePath(webRoot, file)
                .Replace('\\', '/')
                .TrimStart('/');

            if (referenced.Contains(relative)) continue;

            try
            {
                File.Delete(file);
                deleted += 1;
                _logger.LogInformation(
                    "MediaCleanup: archivo huérfano purgado: {File}", relative);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "MediaCleanup: no se pudo borrar {File}", relative);
            }
        }

        if (deleted > 0)
        {
            _logger.LogInformation(
                "MediaCleanup: {Count} archivo(s) huérfano(s) eliminados de {Root}.",
                deleted, productsRoot);
        }
    }

    private static void AddReference(HashSet<string> set, string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return;

        var path = url.Trim();
        if (path.StartsWith("http", StringComparison.OrdinalIgnoreCase) &&
            Uri.TryCreate(path, UriKind.Absolute, out var uri))
        {
            path = uri.AbsolutePath;
        }

        var normalized = path.TrimStart('/').Replace('\\', '/');
        if (normalized.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase))
            set.Add(normalized);
    }
}
