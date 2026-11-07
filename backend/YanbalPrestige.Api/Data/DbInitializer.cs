using Microsoft.EntityFrameworkCore;
using YanbalPrestige.Api.Common.Enums;
using YanbalPrestige.Api.Common.Security;
using YanbalPrestige.Api.Entities;

namespace YanbalPrestige.Api.Data;

public static class DbInitializer
{
    /// <summary>Contraseña de demostración para los usuarios sembrados.</summary>
    public const string DemoPassword = "yanbal2026";

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
                PasswordHash = PasswordHasher.Hash(DemoPassword),
                Role = UserRole.Director,
                Phone = "+57 312 456 7890",
                DocumentId = "1020304050",
                Zone = "Zona 12 - Bogotá Norte",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var consultant = new User
            {
                Id = "usr-consultant-carolina",
                FullName = "Carolina Mejía (Consultora)",
                Email = "carolina.mejia@yanbalprestige.com",
                PasswordHash = PasswordHasher.Hash(DemoPassword),
                Role = UserRole.Consultant,
                Phone = "+57 300 123 4567",
                DocumentId = "1098765432",
                Zone = "Zona 12 - Suba",
                IsActive = true,
                LeaderId = "usr-leader-andrea",
                CreatedAt = DateTime.UtcNow
            };

            var leader = new User
            {
                Id = "usr-leader-andrea",
                FullName = "Andrea Gómez (Líder de Zona)",
                Email = "andrea.lider@yanbalprestige.com",
                PasswordHash = PasswordHasher.Hash(DemoPassword),
                Role = UserRole.Leader,
                Phone = "+57 320 888 9900",
                DocumentId = "52890123",
                Zone = "Zona 15 - Medellín",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var consultantTwo = new User
            {
                Id = "usr-consultant-paula",
                FullName = "Paula Ríos (Consultora)",
                Email = "paula.rios@yanbalprestige.com",
                PasswordHash = PasswordHasher.Hash(DemoPassword),
                Role = UserRole.Consultant,
                Phone = "+57 312 555 7788",
                DocumentId = "1017888999",
                Zone = "Zona 15 - Envigado",
                IsActive = true,
                LeaderId = "usr-leader-andrea",
                CreatedAt = DateTime.UtcNow
            };

            var consultantThree = new User
            {
                Id = "usr-consultant-diana",
                FullName = "Diana Salazar (Consultora)",
                Email = "diana.salazar@yanbalprestige.com",
                PasswordHash = PasswordHasher.Hash(DemoPassword),
                Role = UserRole.Consultant,
                Phone = "+57 300 111 2233",
                DocumentId = "1122334455",
                Zone = "Zona 12 - Usaquén",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var assistant = new User
            {
                Id = "usr-assistant-laura",
                FullName = "Laura Asistente (Administrativa)",
                Email = "laura.asistente@yanbalprestige.com",
                PasswordHash = PasswordHasher.Hash(DemoPassword),
                Role = UserRole.Assistant,
                Phone = "+57 311 444 5566",
                DocumentId = "1033445566",
                Zone = "Zona 12 - Bogotá",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            // La líder debe existir antes que las consultoras que la referencian.
            await context.Users.AddRangeAsync(director, leader);
            await context.SaveChangesAsync();
            await context.Users.AddRangeAsync(consultant, consultantTwo, consultantThree, assistant);
            // Persistir antes de sembrar las clientas: sus FK apuntan a estas
            // consultoras y EF no conoce la dependencia entre ambos bloques.
            await context.SaveChangesAsync();
        }
        else
        {
            // Bases creadas antes del hardening: reemplaza hashes de relleno
            // por PBKDF2 real para que el login de demostración funcione.
            var legacyUsers = await context.Users
                .Where(u =>
                    u.Email == "yulieth.directora@yanbalprestige.com" ||
                    u.Email == "carolina.mejia@yanbalprestige.com")
                .ToListAsync();

            foreach (var legacy in legacyUsers.Where(u => PasswordHasher.NeedsRehash(u.PasswordHash)))
            {
                legacy.PasswordHash = PasswordHasher.Hash(DemoPassword);
                legacy.UpdatedAt = DateTime.UtcNow;
            }

            // Bases antiguas: completa cédula y zona si faltan.
            var profiles = new Dictionary<string, (string DocumentId, string Zone)>
            {
                ["yulieth.directora@yanbalprestige.com"] = ("1020304050", "Zona 12 - Bogotá Norte"),
                ["carolina.mejia@yanbalprestige.com"] = ("1098765432", "Zona 12 - Suba"),
                ["andrea.lider@yanbalprestige.com"] = ("52890123", "Zona 15 - Medellín"),
                ["paula.rios@yanbalprestige.com"] = ("1017888999", "Zona 15 - Envigado"),
                ["diana.salazar@yanbalprestige.com"] = ("1122334455", "Zona 12 - Usaquén"),
                ["laura.asistente@yanbalprestige.com"] = ("1033445566", "Zona 12 - Bogotá"),
            };
            var demoEmails = profiles.Keys.ToList();
            var allDemoUsers = await context.Users
                .Where(u => demoEmails.Contains(u.Email))
                .ToListAsync();
            foreach (var demo in allDemoUsers)
            {
                var profile = profiles[demo.Email];
                if (string.IsNullOrWhiteSpace(demo.DocumentId)) demo.DocumentId = profile.DocumentId;
                if (string.IsNullOrWhiteSpace(demo.Zone)) demo.Zone = profile.Zone;
            }
            await context.SaveChangesAsync();

            // Bases antiguas sin jerarquía: crea la líder y asigna a Carolina.
            if (!context.Users.Any(u => u.Role == UserRole.Leader))
            {
                var leader = new User
                {
                    Id = "usr-leader-andrea",
                    FullName = "Andrea Gómez (Líder de Zona)",
                    Email = "andrea.lider@yanbalprestige.com",
                    PasswordHash = PasswordHasher.Hash(DemoPassword),
                    Role = UserRole.Leader,
                    Phone = "+57 320 888 9900",
                    DocumentId = "52890123",
                    Zone = "Zona 15 - Medellín",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                await context.Users.AddAsync(leader);
                await context.SaveChangesAsync();

                var carolina = context.Users.FirstOrDefault(u =>
                    u.Email == "carolina.mejia@yanbalprestige.com");
                if (carolina != null)
                {
                    carolina.LeaderId = leader.Id;
                    await context.SaveChangesAsync();
                }
            }

            // Bases antiguas sin asistente: agrega la cuenta de apoyo.
            if (!context.Users.Any(u => u.Role == UserRole.Assistant))
            {
                await context.Users.AddAsync(new User
                {
                    Id = "usr-assistant-laura",
                    FullName = "Laura Asistente (Administrativa)",
                    Email = "laura.asistente@yanbalprestige.com",
                    PasswordHash = PasswordHasher.Hash(DemoPassword),
                    Role = UserRole.Assistant,
                    Phone = "+57 311 444 5566",
                    DocumentId = "1033445566",
                    Zone = "Zona 12 - Bogotá",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
                await context.SaveChangesAsync();
            }
        }

        // Cuenta de soporte del equipo desarrollador. Solo se crea o actualiza
        // si SUPPORT_EMAIL y SUPPORT_PASSWORD están definidas en el entorno;
        // nunca se guarda una contraseña fija en el repositorio.
        await SeedSupportAccountAsync(context);

        // 2. Cartera de clientas de ejemplo (CRM por consultora).
        if (!context.ConsultantClients.Any())
        {
            await context.ConsultantClients.AddRangeAsync(
                new ConsultantClient
                {
                    Id = "cli-1",
                    ConsultantId = "usr-consultant-carolina",
                    FullName = "Camila Restrepo",
                    Phone = "+57 312 456 7890",
                    SkinType = "Mixta",
                    FavoriteCategory = "Tratamiento Facial",
                    Notes = "Usa Suero Extracto Divino cada noche. Le encanta la textura no grasa.",
                    LastContactDate = DateTime.UtcNow.AddDays(-2),
                },
                new ConsultantClient
                {
                    Id = "cli-2",
                    ConsultantId = "usr-consultant-carolina",
                    FullName = "Valentina Morales",
                    Phone = "+57 318 999 1122",
                    SkinType = "Normal",
                    FavoriteCategory = "Perfumería",
                    Notes = "Fanática de Ccori Cristal. Comprar en fechas especiales.",
                    LastContactDate = DateTime.UtcNow.AddDays(-5),
                },
                new ConsultantClient
                {
                    Id = "cli-3",
                    ConsultantId = "usr-consultant-paula",
                    FullName = "Laura Cárdenas",
                    Phone = "+57 301 444 8899",
                    SkinType = "Seca",
                    FavoriteCategory = "Protección Solar",
                    Notes = "Piel sensible al sol. Prefiere texturas ligeras.",
                    LastContactDate = DateTime.UtcNow.AddDays(-1),
                },
                new ConsultantClient
                {
                    Id = "cli-4",
                    ConsultantId = "usr-leader-andrea",
                    FullName = "Sofía Betancur",
                    Phone = "+57 310 777 1122",
                    SkinType = "Grasa",
                    FavoriteCategory = "Maquillaje",
                    Notes = "Clienta de la líder. Busca base de cobertura media.",
                    LastContactDate = DateTime.UtcNow.AddDays(-3),
                }
            );
            await context.SaveChangesAsync();
        }

        // 3. Categorías base (3FN) antes de los productos que las referencian.
        if (!context.ProductCategories.Any())
        {
            await context.ProductCategories.AddRangeAsync(
                new ProductCategory { Code = "rostro", Label = "Tratamiento Facial", Order = 1 },
                new ProductCategory { Code = "solares", Label = "Protección Solar", Order = 2 },
                new ProductCategory { Code = "perfumeria", Label = "Perfumería Fina", Order = 3 },
                new ProductCategory { Code = "maquillaje", Label = "Maquillaje Funcional", Order = 4 },
                new ProductCategory { Code = "joyeria", Label = "Joyería Fina", Order = 5 }
            );
            await context.SaveChangesAsync();
        }

        // 3. Semillero de Productos Iniciales si está vacío
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
                    Price = 142000,
                    OriginalPrice = 175000,
                    Image = "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80",
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

    /// <summary>
    /// Crea o actualiza la cuenta de soporte del equipo desarrollador a partir
    /// de <c>SUPPORT_EMAIL</c> y <c>SUPPORT_PASSWORD</c>. Si las variables no
    /// existen, no se crea nada. La contraseña se re-hashea solo cuando cambia,
    /// de modo que rotarla en el entorno se aplica en el siguiente arranque.
    /// </summary>
    private static async Task SeedSupportAccountAsync(AppDbContext context)
    {
        var email = Environment.GetEnvironmentVariable("SUPPORT_EMAIL")?.Trim().ToLowerInvariant();
        var password = Environment.GetEnvironmentVariable("SUPPORT_PASSWORD");

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            return;

        const string supportId = "usr-developer-bscl";
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
        {
            user = new User
            {
                Id = supportId,
                FullName = "Soporte BSCL (Desarrollador)",
                Email = email,
                Role = UserRole.Developer,
                Phone = "",
                DocumentId = "SOPORTE-BSCL",
                Zone = "Soporte técnico",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            await context.Users.AddAsync(user);
        }
        else if (user.Role != UserRole.Developer && user.Id != supportId)
        {
            // No se secuestra una cuenta existente que use ese correo.
            Console.WriteLine(
                $"[SUPPORT] El correo {email} ya pertenece a otra cuenta; no se convirtió en soporte.");
            return;
        }

        user.Role = UserRole.Developer;
        user.IsActive = true;
        user.UpdatedAt = DateTime.UtcNow;

        if (!PasswordHasher.Verify(password, user.PasswordHash))
            user.PasswordHash = PasswordHasher.Hash(password);

        await context.SaveChangesAsync();
        Console.WriteLine($"[SUPPORT] Cuenta de soporte lista para {email}.");
    }
}
