using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YanbalPrestige.Api.Models;

[Table("eventos")]
public class EventItem
{
    [Key]
    [Column("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Column("titulo")]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Column("fecha")]
    [MaxLength(100)]
    public string Date { get; set; } = string.Empty;

    [Column("hora")]
    [MaxLength(50)]
    public string Time { get; set; } = string.Empty;

    [Column("modalidad")]
    [MaxLength(50)]
    public string Modality { get; set; } = "Presencial";

    [Column("ubicacion")]
    [MaxLength(250)]
    public string Location { get; set; } = string.Empty;

    [Column("imagen_url")]
    public string Image { get; set; } = string.Empty;

    [Column("descripcion")]
    public string Description { get; set; } = string.Empty;

    [Column("cupos_texto")]
    [MaxLength(100)]
    public string Spots { get; set; } = string.Empty;

    [Column("activo")]
    public bool IsActive { get; set; } = true;
}
