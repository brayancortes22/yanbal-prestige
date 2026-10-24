using System.ComponentModel.DataAnnotations;

namespace YanbalPrestige.Api.DTOs;

public class ConsultantClientDto
{
    public string? Id { get; set; }

    [Required]
    public string ConsultantId { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string Phone { get; set; } = string.Empty;

    public string SkinType { get; set; } = "Mixta";

    public string? FragrancePreference { get; set; }

    public string? JewelryPreference { get; set; }

    public string? Notes { get; set; }

    public DateTime? LastContactDate { get; set; }
}
