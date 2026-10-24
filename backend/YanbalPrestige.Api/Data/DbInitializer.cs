using YanbalPrestige.Api.Common.Enums;
using YanbalPrestige.Api.Entities;

namespace YanbalPrestige.Api.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // 1. Semillero de Usuario Administrador (Directora Yuli)
        if (!context.Users.Any())
        {
            var director = new User
            {
                Id = "usr-director-yuli",
                FullName = "Yulieth Ospina (Directora)",
                Email = "yulieth.directora@yanbalprestige.com",
                PasswordHash = "AQAAAAEAACcQAAAAEJb...", // En producción se usa BCrypt / PBKDF2
                Role = UserRole.Director,
                Phone = "+57 312 456 7890",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var consultant = new User
            {
                Id = "usr-consultant-carolina",
                FullName = "Carolina Mejía (Consultora)",
                Email = "carolina.mejia@yanbalprestige.com",
                PasswordHash = "AQAAAAEAACcQAAAAEJb...",
                Role = UserRole.Consultant,
                Phone = "+57 300 123 4567",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await context.Users.AddRangeAsync(director, consultant);
        }

        // 2. Semillero de Productos Iniciales si está vacío
        if (!context.Products.Any())
        {
            var initialProducts = new List<Product>
            {
                new()
                {
                    Id = "extracto-divino",
                    Code = "SKU-ED-001",
                    Name = "Extracto Divino Concentrado Reactivador",
                    Category = "rostro",
                    CategoryLabel = "Tratamiento Facial",
                    Price = 168000,
                    OriginalPrice = 210000,
                    Image = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
                    Description = "Tratamiento facial antiedad global con Cáliz de Uvilla. Reduce arrugas profundas y reactiva la juventud celular.",
                    Badge = "Top Ventas",
                    UsageStepsJson = "[\"Limpiar rostro y cuello con agua micelar\",\"Aplicar 3-4 gotas sobre la yema de los dedos\",\"Masajear en movimientos ascendentes hasta su absorción\",\"Usar mañana y noche antes de la crema hidratante\"]",
                    ConsultantTip = "Ideal para clientas mayores de 40 años que buscan firmeza y luminosidad inmediata. Recomienda combinar con la crema de noche.",
                    IsActive = true
                },
                new()
                {
                    Id = "suero-antioxidante",
                    Code = "SKU-SA-002",
                    Name = "Suero Concentrado Antioxidante Vitamina C",
                    Category = "rostro",
                    CategoryLabel = "Tratamiento Facial",
                    Price = 142000,
                    OriginalPrice = 175000,
                    Image = "https://images.unsplash.com/photo-1608248597359-009772a0f8df?auto=format&fit=crop&w=800&q=80",
                    Description = "Potente suero con 15% de Vitamina C pura y extracto de Camu Camu. Ilumina, unifica el tono y protege contra la polución.",
                    Badge = "Recomendado",
                    UsageStepsJson = "[\"Aplicar por la mañana sobre la piel limpia\",\"Distribuir en rostro, cuello y escote\",\"Esperar 1 minuto antes de aplicar el protector solar\"]",
                    ConsultantTip = "Perfecto para pieles apagadas con manchas por sol. Siempre enfatizar el uso del protector solar encima.",
                    IsActive = true
                },
                new()
                {
                    Id = "libertage-nocturne",
                    Code = "SKU-LN-003",
                    Name = "Libertâge Nocturne Sérum Reparador",
                    Category = "rostro",
                    CategoryLabel = "Tratamiento Facial",
                    Price = 155000,
                    OriginalPrice = 195000,
                    Image = "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
                    Description = "Sérum de noche renovador que acelera el proceso de reparación celular mientras duermes.",
                    Badge = "Innovación",
                    UsageStepsJson = "[\"Uso exclusivo nocturno\",\"Aplicar 4 gotas tras la limpieza\",\"Dejar actuar toda la noche sin enjuagar\"]",
                    ConsultantTip = "Explícale a la clienta que trabaja sincronizado con el ritmo circadiano nocturno para máxima regeneración.",
                    IsActive = true
                }
            };

            await context.Products.AddRangeAsync(initialProducts);
        }

        // 3. Semillero de Catálogo Digital
        if (!context.DigitalCatalogs.Any())
        {
            await context.DigitalCatalogs.AddAsync(new DigitalCatalog
            {
                Id = "catalog-c10",
                CurrentCampaign = "Campaña 10 - 2026",
                CatalogPdfUrl = "https://catalogos.yanbal.com/colombia/c10",
                CoverImageUrl = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
                ValidUntil = "30 de Octubre",
                IsActive = true
            });
        }

        await context.SaveChangesAsync();
    }
}
