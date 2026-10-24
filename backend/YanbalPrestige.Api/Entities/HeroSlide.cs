using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YanbalPrestige.Api.Entities;

[Table("cms_hero_slides")]
public class HeroSlide
{
    [Key]
    [Column("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(200)]
    [Column("titulo")]
    public string Title { get; set; } = string.Empty;

    [MaxLength(300)]
    [Column("subtitulo")]
    public string Subtitle { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column("tag")]
    public string Tag { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column("bg_gradient")]
    public string BgGradient { get; set; } = string.Empty;

    [Column("imagen_url")]
    public string ImageUrl { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column("boton_texto")]
    public string ButtonText { get; set; } = "Ver Catálogo";

    [MaxLength(200)]
    [Column("boton_link")]
    public string ButtonLink { get; set; } = "/catalogo";

    [Column("orden")]
    public int Order { get; set; } = 0;

    [Column("activo")]
    public bool IsActive { get; set; } = true;
}
