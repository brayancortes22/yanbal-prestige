using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using YanbalPrestige.Api.Data;
using YanbalPrestige.Api.Services.Implementations;
using YanbalPrestige.Api.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// 1. Controladores y Documentación OpenAPI / Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. Registro de Inyección de Dependencias (Service Layer)
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICatalogService, CatalogService>();
builder.Services.AddScoped<ICrmService, CrmService>();
builder.Services.AddScoped<ICmsService, CmsService>();
builder.Services.AddScoped<IMediaStorageService, MediaStorageService>();

// 3. Caché de salida para alta concurrencia
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(b => b.Expire(TimeSpan.FromSeconds(30)));
});

// 4. Blindaje contra Fuerza Bruta y Bots (Regla 8)
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("ApiGlobalLimiter", opt =>
    {
        opt.PermitLimit = 120;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 10;
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });
    options.AddFixedWindowLimiter("StrictLeadsLimiter", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });
});

// 5. Configuración de Base de Datos MySQL con EF Core
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=localhost;Database=yanbal_prestige;User=root;Password=root;";

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseMySQL(connectionString);
});

// 6. Política de CORS para Producción y Desarrollo
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173", 
                "http://localhost:3000", 
                "http://127.0.0.1:5173",
                "https://yanbal-prestige-web.vercel.app",
                "https://yanbalprestige.com"
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// 7. Middleware de Cabeceras de Seguridad Bancaria / OWASP
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Frame-Options", "SAMEORIGIN");
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    await next();
});

// 8. Swagger en desarrollo y staging
if (app.Environment.IsDevelopment() || app.Environment.IsStaging())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Yanbal Prestige API v1"));
}

// 9. Pipeline de Middlewares
app.UseStaticFiles(); // Servir /uploads/ directamente desde el VPS
app.UseCors("AllowFrontend");
app.UseRateLimiter();
app.UseOutputCache();
app.UseAuthorization();
app.MapControllers().RequireRateLimiting("ApiGlobalLimiter");

// 10. Inicialización y Semillero Automático de Datos
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.EnsureCreated();
        await DbInitializer.SeedAsync(db);
    }
    catch
    {
        // En caso de que el motor MySQL no esté corriendo localmente, se continúa sin bloquear el arranque
    }
}

app.Run();
