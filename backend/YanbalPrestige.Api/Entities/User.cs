using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YanbalPrestige.Api.Common.Enums;

namespace YanbalPrestige.Api.Entities;

[Table("usuarios")]
public class User
{
    [Key]
    [Column("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(150)]
    [Column("nombre_completo")]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    [Column("correo")]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("rol")]
    public UserRole Role { get; set; } = UserRole.Consultant;

    [MaxLength(30)]
    [Column("telefono")]
    public string Phone { get; set; } = string.Empty;

    [Column("activo")]
    public bool IsActive { get; set; } = true;

    [Column("creado_en")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("actualizado_en")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
