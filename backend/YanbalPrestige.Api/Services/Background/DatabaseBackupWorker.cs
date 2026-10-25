using System.Diagnostics;
using System.Text;
using Microsoft.EntityFrameworkCore;
using YanbalPrestige.Api.Data;

namespace YanbalPrestige.Api.Services.Background;

public class DatabaseBackupWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DatabaseBackupWorker> _logger;
    private readonly IConfiguration _config;

    public DatabaseBackupWorker(IServiceProvider serviceProvider, ILogger<DatabaseBackupWorker> logger, IConfiguration config)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _config = config;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("DatabaseBackupWorker: Servicio de copias de seguridad automáticas iniciado.");

        // Esperar 15 segundos tras el inicio del servidor antes del primer ciclo
        await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CreateBackupAsync();
                PurgeOldBackups();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "DatabaseBackupWorker: Error durante la generación del backup.");
            }

            // Ejecutar cada 24 horas
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }

    private async Task CreateBackupAsync()
    {
        var backupDir = Path.Combine(AppContext.BaseDirectory, "backups");
        if (!Directory.Exists(backupDir))
            Directory.CreateDirectory(backupDir);

        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
        var backupPath = Path.Combine(backupDir, $"backup_yanbal_{timestamp}.sql");

        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Respaldo estructural y semillero de datos mediante script SQL de EF Core
        var script = context.Database.GenerateCreateScript();
        var header = $"-- YANBAL PRESTIGE DATABASE BACKUP AUTOMATIZADO\n-- FECHA: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC\n\n";
        
        await File.WriteAllTextAsync(backupPath, header + script, Encoding.UTF8);
        var fileInfo = new FileInfo(backupPath);
        _logger.LogInformation("DatabaseBackupWorker: Backup exitoso generado en {Path} ({Size} KB)", backupPath, fileInfo.Length / 1024);
    }

    private void PurgeOldBackups()
    {
        var backupDir = Path.Combine(AppContext.BaseDirectory, "backups");
        if (!Directory.Exists(backupDir)) return;

        var threshold = DateTime.UtcNow.AddDays(-30);
        var files = Directory.GetFiles(backupDir, "backup_yanbal_*.sql");

        foreach (var file in files)
        {
            var info = new FileInfo(file);
            if (info.CreationTimeUtc < threshold)
            {
                try
                {
                    File.Delete(file);
                    _logger.LogInformation("DatabaseBackupWorker: Backup obsoleto purgado: {Name}", info.Name);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "No se pudo purgar backup: {Name}", info.Name);
                }
            }
        }
    }
}
