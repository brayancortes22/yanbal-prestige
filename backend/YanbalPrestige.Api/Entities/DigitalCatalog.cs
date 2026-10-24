using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YanbalPrestige.Api.Entities;

[Table("cms_catalogo_digital")]
public class DigitalCatalog
{
    [Key]
    [Column("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(100)]
    [Column("campana_actual")]
    public string CurrentCampaign { get; set; } = string.Empty;

    [Column("catalogo_pdf_url")]
    public string CatalogPdfUrl { get; set; } = string.Empty;

    [Column("cover_imagen_url")]
    public string CoverImageUrl { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column("valido_hasta")]
    public string ValidUntil { get; set; } = string.Empty;

    [Column("activo")]
    public bool IsActive { get; set; } = true;
}
