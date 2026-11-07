using System.ComponentModel.DataAnnotations;

namespace YanbalPrestige.Api.DTOs;

/// <summary>
/// Contrato explícito para crear/editar productos. Antes el controlador
/// enlazaba directamente la entidad <c>Product</c>, lo que permitía
/// mass assignment sobre cualquier columna.
/// </summary>
public class ProductCreateUpdateDto
{
    public string? Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = string.Empty;

    /// <summary>Etiqueta visible; se usa para crear la categoría si no existe.</summary>
    [MaxLength(100)]
    public string CategoryLabel { get; set; } = string.Empty;

    [Range(0, 99999999)]
    public decimal Price { get; set; }

    [Range(0, 99999999)]
    public decimal? OriginalPrice { get; set; }

    [MaxLength(500)]
    public string Image { get; set; } = string.Empty;

    /// <summary>Galería de fotos y videos del producto (máximo 10 en el servicio).</summary>
    public List<ProductMediaDto>? Media { get; set; }

    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Badge { get; set; }

    [MaxLength(2000)]
    public string UsageStepsJson { get; set; } = "[]";

    [MaxLength(1000)]
    public string ConsultantTip { get; set; } = string.Empty;

    [MaxLength(100)]
    public string BotanicalTitle { get; set; } = "Fórmula Botánica";

    [MaxLength(250)]
    public string BotanicalDesc { get; set; } = "Ingredientes activos puros";

    [MaxLength(100)]
    public string WarrantyTitle { get; set; } = "100% Original Yanbal";

    [MaxLength(250)]
    public string WarrantyDesc { get; set; } = "Garantía oficial de fábrica";

    [MaxLength(100)]
    public string CommitmentTitle { get; set; } = "Compromiso Yanbal Prestige";

    [MaxLength(2000)]
    public string CommitmentText { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}

public record ProductMediaDto(
    string Type,
    string Url,
    string? Alt
);

public class ProductFilterDto
{
    public string? Category { get; set; }
    public string? Query { get; set; }
    public bool OnlyActive { get; set; } = true;
}
