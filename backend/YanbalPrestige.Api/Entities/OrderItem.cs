using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YanbalPrestige.Api.Entities;

[Table("pedido_items")]
public class OrderItem
{
    [Key]
    [Column("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Column("pedido_id")]
    [MaxLength(50)]
    public string OrderId { get; set; } = string.Empty;

    [Column("producto_id")]
    [MaxLength(50)]
    public string ProductId { get; set; } = string.Empty;

    [Column("producto_sku")]
    [MaxLength(50)]
    public string ProductSku { get; set; } = string.Empty;

    [Column("producto_nombre")]
    [MaxLength(200)]
    public string ProductName { get; set; } = string.Empty;

    [Column("precio_unitario", TypeName = "decimal(12,2)")]
    public decimal UnitPrice { get; set; }

    [Column("cantidad")]
    public int Quantity { get; set; } = 1;

    [Column("subtotal", TypeName = "decimal(12,2)")]
    public decimal Subtotal { get; set; }
}
