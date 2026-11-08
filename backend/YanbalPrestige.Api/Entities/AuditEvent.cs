using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YanbalPrestige.Api.Entities;

[Table("auditoria_eventos")]
public class AuditEvent
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Column("actor_id")]
    [MaxLength(50)]
    public string? ActorId { get; set; }

    [Column("accion")]
    [Required]
    [MaxLength(80)]
    public string Action { get; set; } = string.Empty;

    [Column("entidad")]
    [Required]
    [MaxLength(80)]
    public string Entity { get; set; } = string.Empty;

    [Column("entidad_id")]
    [MaxLength(50)]
    public string? EntityId { get; set; }

    [Column("ip")]
    [MaxLength(45)]
    public string? Ip { get; set; }

    [Column("detalle_json")]
    public string? DetailsJson { get; set; }

    [Column("creado_en")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
