using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YanbalPrestige.Api.Entities;

[Table("cms_video_tips")]
public class VideoTip
{
    [Key]
    [Column("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(200)]
    [Column("titulo")]
    public string Title { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column("duracion")]
    public string Duration { get; set; } = string.Empty;

    [Column("thumbnail_url")]
    public string ThumbnailUrl { get; set; } = string.Empty;

    [Column("video_url")]
    public string VideoUrl { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column("categoria")]
    public string Category { get; set; } = string.Empty;

    [Column("orden")]
    public int Order { get; set; } = 0;

    [Column("activo")]
    public bool IsActive { get; set; } = true;
}
