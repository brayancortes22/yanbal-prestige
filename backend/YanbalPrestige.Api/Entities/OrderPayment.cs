using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YanbalPrestige.Api.Entities;

/// <summary>
/// Movimiento de pago o abono de un pedido. Permite saber cuánto dinero
/// entregó la clienta, con qué método y en qué fecha, en lugar de guardar
/// solo la etiqueta "abono".
/// </summary>
[Table("pagos_pedido")]
public class OrderPayment
{
    [Key]
    [Column("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(50)]
    [Column("pedido_id")]
    public string OrderId { get; set; } = string.Empty;

    [Column("monto", TypeName = "decimal(12,2)")]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(30)]
    [Column("metodo")]
    public string Method { get; set; } = "efectivo";

    [MaxLength(100)]
    [Column("referencia")]
    public string? Note { get; set; }

    [MaxLength(50)]
    [Column("registrado_por")]
    public string? RegisteredBy { get; set; }

    [Column("fecha_pago")]
    public DateTime Date { get; set; } = DateTime.UtcNow;
}
