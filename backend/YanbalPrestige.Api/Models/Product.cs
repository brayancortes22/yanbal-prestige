using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YanbalPrestige.Api.Models;

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

    [Column("categoria_label")]
    [MaxLength(100)]
    public string CategoryLabel { get; set; } = string.Empty;

    [Column("precio", TypeName = "decimal(12,2)")]
    public decimal Price { get; set; }

    [Column("precio_original", TypeName = "decimal(12,2)")]
    public decimal? OriginalPrice { get; set; }

    [Column("imagen_url")]
    public string Image { get; set; } = string.Empty;

    [Column("descripcion")]
    public string Description { get; set; } = string.Empty;

    [Column("badge")]
    [MaxLength(50)]
    public string? Badge { get; set; }

    [Column("modo_uso_json")]
    public string UsageStepsJson { get; set; } = "[]";

    [Column("tip_consultora")]
    public string ConsultantTip { get; set; } = string.Empty;

    [Column("activo")]
    public bool IsActive { get; set; } = true;
}
