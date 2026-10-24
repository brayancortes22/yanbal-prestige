using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YanbalPrestige.Api.Entities;

[Table("clientes_consultora")]
public class ConsultantClient
{
    [Key]
    [Column("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(100)]
    [Column("consultora_id")]
    public string ConsultantId { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    [Column("nombre_completo")]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    [Column("telefono")]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column("tipo_piel")]
    public string SkinType { get; set; } = "Mixta";

    [MaxLength(100)]
    [Column("preferencia_fragancia")]
    public string? FragrancePreference { get; set; }

    [MaxLength(100)]
    [Column("preferencia_joyeria")]
    public string? JewelryPreference { get; set; }

    [Column("notas")]
    public string? Notes { get; set; }

    [Column("ultimo_contacto")]
    public DateTime LastContactDate { get; set; } = DateTime.UtcNow;

    [Column("creado_en")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
