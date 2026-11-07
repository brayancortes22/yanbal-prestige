using System.Security.Cryptography;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using YanbalPrestige.Api.Common.Security;
using YanbalPrestige.Api.Data;
using YanbalPrestige.Api.Services.Background;
using YanbalPrestige.Api.Services.Implementations;
using YanbalPrestige.Api.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// El proveedor de EventLog de Windows exige permisos que una cuenta de
// servicio o un contenedor no tienen; si falla, Kestrel aborta la conexión
// y el cliente ve "fetch failed". Se deja logging a consola, que es el
// estándar para despliegues en Render/Docker.
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// 0. Límite de cuerpo para subida de videos (150 MB + margen de formulario)
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 160L * 1024 * 1024;
});

// 1. Controladores y Documentación OpenAPI nativa de .NET 10
builder.Services.AddControllers();

// Formularios: los archivos pequeños/medianos se procesan en memoria y los
// grandes se vuelcan al directorio temporal del sistema. Subir el umbral
// evita crear un archivo temporal por cada foto de 100 KB.
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MemoryBufferThreshold = 4 * 1024 * 1024;
    options.ValueLengthLimit = 512 * 1024 * 1024;
    options.MultipartBodyLengthLimit = 160L * 1024 * 1024;
});
builder.Services.AddOpenApi();

// 2. Registro de Inyección de Dependencias (Service Layer)
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICatalogService, CatalogService>();
builder.Services.AddScoped<ICrmService, CrmService>();
builder.Services.AddScoped<ICmsService, CmsService>();
builder.Services.AddScoped<IMediaStorageService, MediaStorageService>();
builder.Services.AddScoped<ITipService, TipService>();
builder.Services.AddSingleton<ITokenService, TokenService>();

// 3. Servicio en Segundo Plano: Backups Automáticos y Purga (Regla 8 y 19)
builder.Services.AddHostedService<DatabaseBackupWorker>();
builder.Services.AddHostedService<MediaCleanupWorker>();

// 4. Blindaje Anti-Bots Cloudflare Turnstile Invisible (Regla 8)
builder.Services.Configure<TurnstileSettings>(builder.Configuration.GetSection(TurnstileSettings.SectionName));
builder.Services.AddHttpClient<ITurnstileService, TurnstileService>();

// 5. Caché de salida para alta concurrencia.
// La política base NO cachea: solo los endpoints públicos marcados con
// [OutputCache(PolicyName = "PublicCatalog")] se benefician de la RAM.
// Antes la política global de 30 s podía servir respuestas autenticadas
// (pedidos, CRM) a otro usuario.
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(b => b.NoCache());
    options.AddPolicy("PublicCatalog", b => b
        .Expire(TimeSpan.FromSeconds(30))
        .SetVaryByQuery("*")
        .Tag("catalog"));
});

// 6. Blindaje contra Fuerza Bruta y Bots (Regla 8)
var globalPermitLimit = builder.Configuration.GetValue("RateLimiting:GlobalPermitLimit", 600);

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Límite global por IP. Debe ser GlobalLimiter (no un endpoint policy):
    // si se aplica con RequireRateLimiting a todos los controladores, esa
    // política pisa a las más estrictas ([EnableRateLimiting("AuthLimiter")])
    // y el límite de fuerza bruta deja de existir.
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
    {
        var partitionKey =
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        return RateLimitPartition.GetFixedWindowLimiter(partitionKey, _ =>
            new FixedWindowRateLimiterOptions
            {
                // 600/min por IP: 120 era demasiado bajo para redes compartidas
                // (NAT de operadores móviles y oficinas).
                PermitLimit = globalPermitLimit,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 10,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            });
    });
    options.AddFixedWindowLimiter("AuthLimiter", opt =>
    {
        opt.PermitLimit = 10;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });
    options.AddFixedWindowLimiter("StrictLeadsLimiter", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });
    options.AddFixedWindowLimiter("StrictUploadLimiter", opt =>
    {
        opt.PermitLimit = 10;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });
});

// 7. Configuración de Base de Datos MySQL con EF Core
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    if (!builder.Environment.IsDevelopment())
    {
        throw new InvalidOperationException(
            "Falta ConnectionStrings__DefaultConnection. Configúrela como variable de entorno antes de iniciar en producción.");
    }

    // Solo para desarrollo local; appsettings.Development.json está ignorado por git.
    connectionString =
        "Server=localhost;Database=yanbal_prestige;User=root;Password=root;" +
        "Connection Timeout=3;Default Command Timeout=5;";
}

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseMySQL(connectionString);
});

// 8. Política de CORS para Producción y Desarrollo
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173", 
                "http://localhost:3000", 
                "http://127.0.0.1:5173",
                "https://yanbal-prestige-web.vercel.app",
                "https://yanbal-prestige-9g5o.vercel.app",
                "https://yanbalprestige.com"
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 8b. Autenticación JWT: la clave vive en JWT_KEY, nunca en appsettings versionado
var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>() ?? new JwtSettings();
var jwtKey = builder.Configuration["Jwt:Key"] ?? Environment.GetEnvironmentVariable("JWT_KEY");

if (string.IsNullOrWhiteSpace(jwtKey))
{
    if (builder.Environment.IsDevelopment())
    {
        jwtKey = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48));
        Console.WriteLine(
            "[AVISO] JWT_KEY no configurada. Se generó una clave temporal de desarrollo: " +
            "los tokens emitidos dejan de ser válidos al reiniciar la API.");
    }
    else
    {
        throw new InvalidOperationException(
            "Falta la variable de entorno JWT_KEY. Configure una clave de al menos 32 caracteres antes de iniciar en producción.");
    }
}

if (jwtKey.Length < 32)
{
    throw new InvalidOperationException("JWT_KEY debe tener al menos 32 caracteres para firmar con HMAC-SHA256.");
}

builder.Services.Configure<JwtSettings>(options =>
{
    options.Issuer = jwtSettings.Issuer;
    options.Audience = jwtSettings.Audience;
    options.ExpirationHours = jwtSettings.ExpirationHours;
    options.Key = jwtKey;
});

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(2),
            RoleClaimType = System.Security.Claims.ClaimTypes.Role
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// 9. Middleware de Cabeceras de Seguridad Bancaria / OWASP
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Append("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

    // Los archivos de /uploads/ deben poder mostrarse desde el dominio del
    // frontend aunque la API viva en otro dominio (VPS, Render, Vercel).
    if (context.Request.Path.StartsWithSegments("/uploads"))
    {
        context.Response.Headers.Append("Cross-Origin-Resource-Policy", "cross-origin");
        context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
        context.Response.Headers.Append("Cache-Control", "public, max-age=31536000, immutable");
    }
    else
    {
        context.Response.Headers.Append("Cross-Origin-Resource-Policy", "same-site");
    }

    context.Response.Headers.Append("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
    await next();
});

// 10. OpenAPI en desarrollo y staging
if (app.Environment.IsDevelopment() || app.Environment.IsStaging())
{
    app.MapOpenApi();
}

// 11. Pipeline de Middlewares
app.UseStaticFiles(); // Servir /uploads/ directamente desde el VPS
app.UseCors("AllowFrontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.UseOutputCache();
app.MapControllers();

// 11b. Health Check para Keep-Alive y Monitoreo
app.MapGet("/health", () => Results.Ok(new 
{ 
    status = "healthy", 
    service = "YanbalPrestige.Api", 
    timestamp = DateTime.UtcNow 
})).AllowAnonymous();

// 12. Inicialización y Semillero Automático de Datos
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.EnsureCreated();
        await DbInitializer.SeedAsync(db);
    }
    catch (Exception ex)
    {
        // En desarrollo se permite arrancar sin MySQL para trabajar el frontend.
        // En producción un arranque sin base de datos debe fallar de inmediato.
        Console.WriteLine($"[DB] No fue posible inicializar la base de datos: {ex}");
        if (!app.Environment.IsDevelopment()) throw;
    }
}

app.Run();
