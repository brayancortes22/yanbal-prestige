using System.ComponentModel.DataAnnotations;

namespace YanbalPrestige.Api.DTOs;

public class HeroSlideDto
{
    public string? Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string Subtitle { get; set; } = string.Empty;
    public string Tag { get; set; } = string.Empty;
    public string BgGradient { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string ButtonText { get; set; } = "Ver Catálogo";
    public string ButtonLink { get; set; } = "/catalogo";
    public int Order { get; set; }
    public bool IsActive { get; set; } = true;
}

public class DigitalCatalogDto
{
    public string? Id { get; set; }

    [Required]
    public string CurrentCampaign { get; set; } = string.Empty;

    public string CatalogPdfUrl { get; set; } = string.Empty;
    public string CoverImageUrl { get; set; } = string.Empty;
    public string ValidUntil { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class VideoTipDto
{
    public string? Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string Duration { get; set; } = string.Empty;
    public string ThumbnailUrl { get; set; } = string.Empty;
    public string VideoUrl { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int Order { get; set; }
    public bool IsActive { get; set; } = true;
}
