using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YanbalPrestige.Api.Entities;

/// <summary>
/// Consejo o artículo publicado en la vista pública /tips.
/// Separado de <see cref="VideoTip"/> porque el contenido es editorial
/// (texto largo, categoría, autor) y el video es opcional.
/// </summary>
[Table("cms_tips")]
public class Tip
{
    [Key]
    [Column("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(200)]
    [Column("titulo")]
    public string Title { get; set; } = string.Empty;

    [MaxLength(300)]
    [Column("resumen")]
    public string Summary { get; set; } = string.Empty;

    [Column("contenido", TypeName = "longtext")]
    public string Content { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column("categoria")]
    public string Category { get; set; } = "Rutina";

    [Column("imagen_url")]
    public string Image { get; set; } = string.Empty;

    [Column("video_url")]
    public string? VideoUrl { get; set; }

    [MaxLength(150)]
    [Column("autor")]
    public string Author { get; set; } = string.Empty;

    [Column("destacado")]
    public bool Featured { get; set; }

    [Column("orden")]
    public int Order { get; set; }

    [Column("activo")]
    public bool IsActive { get; set; } = true;

    [Column("creado_en")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("actualizado_en")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
