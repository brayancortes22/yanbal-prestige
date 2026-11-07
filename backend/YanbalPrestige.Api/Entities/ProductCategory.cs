using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YanbalPrestige.Api.Entities;

/// <summary>
/// Catálogo de categorías de producto. Antes el nombre visible de la
/// categoría viajaba repetido en cada fila de `productos` (dependencia
/// transitiva); ahora la etiqueta vive en un único lugar y `productos`
/// solo guarda la clave foránea.
/// </summary>
[Table("categorias_producto")]
public class ProductCategory
{
    [Key]
    [Column("codigo")]
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [Column("etiqueta")]
    [Required, MaxLength(100)]
    public string Label { get; set; } = string.Empty;

    [Column("orden")]
    public int Order { get; set; }

    [Column("activa")]
    public bool IsActive { get; set; } = true;
}
