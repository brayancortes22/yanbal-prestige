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

    [MaxLength(150)]
    [Column("correo")]
    public string Email { get; set; } = string.Empty;

    [MaxLength(30)]
    [Column("documento")]
    public string DocumentId { get; set; } = string.Empty;

    [MaxLength(200)]
    [Column("direccion")]
    public string Address { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column("barrio")]
    public string Neighborhood { get; set; } = string.Empty;

    [MaxLength(20)]
    [Column("codigo_postal")]
    public string PostalCode { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column("ciudad")]
    public string City { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column("tipo_piel")]
    public string SkinType { get; set; } = "Mixta";

    [Column("categoria_favorita")]
    [MaxLength(100)]
    public string FavoriteCategory { get; set; } = "Tratamiento Facial";

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
