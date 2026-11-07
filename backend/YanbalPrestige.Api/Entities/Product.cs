using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace YanbalPrestige.Api.Entities;

public class ProductMedia
{
    public string Type { get; set; } = "image";
    public string Url { get; set; } = string.Empty;
    public string? Alt { get; set; }
}

[Table("productos")]
public class Product
{
    [Key]
    [Column("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Column("codigo")]
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [Column("nombre")]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Column("categoria")]
    [MaxLength(50)]
    public string Category { get; set; } = string.Empty;

    /// <summary>Clave foránea a `categorias_producto` (3FN).</summary>
    [ForeignKey(nameof(Category))]
    public ProductCategory? CategoryRef { get; set; }

    /// <summary>
    /// Etiqueta de presentación calculada desde la tabla de categorías.
    /// No se persiste en `productos`: así se evita la dependencia transitiva
    /// que duplicaba el nombre de la categoría en cada producto.
    /// </summary>
    [NotMapped]
    public string CategoryLabel => CategoryRef?.Label ?? Category;

    [Column("precio", TypeName = "decimal(12,2)")]
    public decimal Price { get; set; }

    [Column("precio_original", TypeName = "decimal(12,2)")]
    public decimal? OriginalPrice { get; set; }

    [Column("imagen_url")]
    public string Image { get; set; } = string.Empty;

    /// <summary>Galería de fotos/videos serializada en la base de datos.</summary>
    [JsonIgnore]
    [Column("media_json")]
    public string MediaJson { get; set; } = "[]";

    /// <summary>Galería deserializada para la respuesta JSON.</summary>
    [NotMapped]
    public List<ProductMedia> Media { get; set; } = new();

    [Column("descripcion")]
    public string Description { get; set; } = string.Empty;

    [Column("badge")]
    [MaxLength(50)]
    public string? Badge { get; set; }

    [Column("modo_uso_json")]
    public string UsageStepsJson { get; set; } = "[]";

    [Column("tip_consultora")]
    public string ConsultantTip { get; set; } = string.Empty;

    [Column("botanical_title")]
    [MaxLength(100)]
    public string BotanicalTitle { get; set; } = "Fórmula Botánica";

    [Column("botanical_desc")]
    [MaxLength(200)]
    public string BotanicalDesc { get; set; } = "Ingredientes activos puros";

    [Column("warranty_title")]
    [MaxLength(100)]
    public string WarrantyTitle { get; set; } = "100% Original Yanbal";

    [Column("warranty_desc")]
    [MaxLength(200)]
    public string WarrantyDesc { get; set; } = "Garantía oficial de fábrica";

    [Column("commitment_title")]
    [MaxLength(100)]
    public string CommitmentTitle { get; set; } = "Compromiso Yanbal Prestige";

    [Column("commitment_text")]
    public string CommitmentText { get; set; } = "Fórmulas no testeadas en animales (Cruelty-Free), hipoalergénicas y enriquecidas con extractos botánicos de la biodiversidad andina.";

    [Column("activo")]
    public bool IsActive { get; set; } = true;
}
