using System.ComponentModel.DataAnnotations;

namespace YanbalPrestige.Api.DTOs;

public class ProductCreateUpdateDto
{
    public string? Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = string.Empty;

    public string CategoryLabel { get; set; } = string.Empty;

    [Range(0, 99999999)]
    public decimal Price { get; set; }

    public decimal? OriginalPrice { get; set; }

    public string Image { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string? Badge { get; set; }

    public string UsageStepsJson { get; set; } = "[]";

    public string ConsultantTip { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}

public class ProductFilterDto
{
    public string? Category { get; set; }
    public string? Query { get; set; }
    public bool OnlyActive { get; set; } = true;
}
