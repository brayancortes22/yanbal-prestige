using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace YanbalPrestige.Api.Entities;

[Table("prospectos_unete")]
public class LeadProspect
{
    [Key]
    [Column("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Column("nombre_completo")]
    [MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [Column("telefono_whatsapp")]
    [MaxLength(50)]
    public string Phone { get; set; } = string.Empty;

    [Column("ciudad")]
    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    [Column("rol_interes")]
    [MaxLength(50)]
    public string RoleInterest { get; set; } = "consultora";

    [Column("acepto_habeas_data")]
    public bool AcceptedHabeasData { get; set; }

    [NotMapped]
    [JsonPropertyName("company_website")]
    public string? CompanyWebsite { get; set; }

    [NotMapped]
    [JsonPropertyName("trapField")]
    public string? TrapField { get; set; }

    [Column("fecha_creacion")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
