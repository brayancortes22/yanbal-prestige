using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YanbalPrestige.Api.Entities;

[Table("pines_restablecimiento")]
public class PasswordResetPin
{
    [Key]
    [Column("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(100)]
    [Column("usuario_id")]
    public string UserId { get; set; } = string.Empty;

    // Almacena el hash PBKDF2 del PIN, nunca el PIN en claro.
    [Required]
    [MaxLength(255)]
    [Column("pin_codigo")]
    public string PinCode { get; set; } = string.Empty;

    [Column("expira_en")]
    public DateTime ExpiresAt { get; set; }

    [Column("usado")]
    public bool IsUsed { get; set; } = false;

    [Column("creado_en")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
